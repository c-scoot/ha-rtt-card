import '../src/rtt-card';
import type { Hass, RttCardConfig, HassEntity } from '../src/types';

const style = document.createElement('style');
style.textContent = `
  :root { font-family: system-ui, sans-serif; color: #17212d; background:#edf1f5; --primary-text-color:#17212d; --secondary-text-color:#516172; --divider-color:#dce2e8; --secondary-background-color:#f2f5f8; --primary-color:#006b91; --success-color:#237544; --warning-color:#956100; --error-color:#b3261e; }
  :root.dark { color-scheme:dark; background:#101820; color:#e8edf3; --primary-text-color:#e8edf3; --secondary-text-color:#b1bfcc; --divider-color:#33414e; --secondary-background-color:#283540; --primary-color:#78cfea; --success-color:#80c99c; --warning-color:#edc275; --error-color:#ffb4ab; }
  * {box-sizing:border-box} body {margin:0} main {max-width:1240px;margin:auto;padding:40px 28px} header {display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:28px} h1 {font-size:34px;letter-spacing:-1px;margin:6px 0} header p {margin:8px 0;color:var(--secondary-text-color)} .eyebrow {font-size:11px;letter-spacing:1.4px;font-weight:700} .controls {display:flex;gap:8px;flex-wrap:wrap;align-content:center} button {padding:10px 14px;border:1px solid var(--divider-color);background:var(--secondary-background-color);color:var(--primary-text-color);border-radius:8px;cursor:pointer;font:inherit;font-size:13px} button:focus-visible {outline:2px solid var(--primary-color)} .layout {display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,1fr);gap:28px} section, aside {min-width:0} aside {background:white;border:1px solid var(--divider-color);border-radius:14px;padding:20px;align-self:start} .dark aside {background:#1c2731} aside h2 {font-size:17px;margin:0 0 16px} ha-card {display:block;background:white;border:1px solid var(--divider-color);border-radius:14px;overflow:hidden} .dark ha-card {background:#1c2731} .note,#event {font-size:12px;line-height:1.6;color:var(--secondary-text-color)} @media(max-width:800px) {.layout{grid-template-columns:1fr}main{padding:24px 14px}h1{font-size:28px}}
`;
document.head.append(style);
class PreviewCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:'open'}).innerHTML = '<style>:host{display:block;background:var(--ha-card-background,#fff);border:1px solid var(--divider-color);border-radius:14px;overflow:hidden}</style><slot></slot>';
  }
}
if (!customElements.get('ha-card')) customElements.define('ha-card', PreviewCard);

type CardElement = HTMLElement & { hass: Hass; setConfig(config: RttCardConfig): void };
const card = document.querySelector<CardElement>('#card')!;
const editor = document.querySelector<CardElement>('#editor')!;
let config: RttCardConfig;
let hass: Hass;

function reset() {
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const date = today.split('/').reverse().join('-');
  const stamp = (time: string) => `${date}T${time}:00+00:00`;
  hass = {states:{},entities:{},devices:{},locale:{language:'en-GB',time_format:'24'},config:{time_zone:'Europe/London'}};
  const cases = [
    ['waterloo','London Waterloo','departure','on_time','17:42','17:42', '4','planned',false],
    ['portsmouth','Portsmouth Harbour','arrival','delayed','18:03','18:11','2','actual',false],
    ['southampton','Southampton Central','departure','cancelled','18:15',null,null,null,false],
    ['reading','Reading','arrival','no_report','18:27',null,'7','actual',true],
    ['basingstoke','Basingstoke','departure','departed','16:10',null,'3','actual',false],
    ['winchester','Winchester','arrival','unavailable','18:40',null,null,null,false],
  ] as const;
  config = {type:'custom:rtt-card',title:'Trains at home',trains:[]};
  for (const [id,name,direction,status,time,expected,platform,source,stale] of cases) {
    const deviceId = `track_${id}`;
    const entity = `sensor.${id}_status`;
    const attrs = {direction,station:'GB-NR:BSK',stale,terminal:['cancelled','departed'].includes(status),platform_source:source};
    hass.devices![deviceId] = {id:deviceId,name};
    const values: Record<string,string> = {status,scheduled:stamp(time),expected:expected ? stamp(expected) : 'unknown',actual:status==='departed'?stamp('16:12'):'unknown',platform:platform??'unknown',delay_minutes:status==='delayed'?'8':status==='departed'?'2':'0',last_success:stamp(stale?'17:20':'17:40')};
    for (const [role,value] of Object.entries(values)) {
      const entityId=`sensor.${id}_${role}`;
      hass.states[entityId]={entity_id:entityId,state:value,attributes:{...attrs,friendly_name:`${name} ${role}`}} satisfies HassEntity;
      hass.entities![entityId]={entity_id:entityId,device_id:deviceId,platform:'realtime_trains',translation_key:role};
    }
    config.trains.push({entity,name});
  }
  card.setConfig(config);editor.setConfig(config);card.hass=hass;editor.hass=hass;
}
reset();
document.querySelector('#theme')!.addEventListener('click',()=>{
  const dark=document.documentElement.classList.toggle('dark');
  document.documentElement.style.setProperty('--ha-card-background',dark?'#1c2731':'#fff');
});
document.querySelector('#reset')!.addEventListener('click',reset);
document.querySelector('#confirm')!.addEventListener('click',()=>{
  const id='sensor.waterloo_platform';
  hass={...hass,states:{...hass.states,[id]:{...hass.states[id],state:'6',attributes:{...hass.states[id].attributes,platform_source:'actual'}}}};
  card.hass=hass;editor.hass=hass;
});
editor.addEventListener('config-changed',(event)=>{
  config=(event as CustomEvent<{config:RttCardConfig}>).detail.config;
  card.setConfig(config);editor.setConfig(config);
});
card.addEventListener('hass-more-info',(event)=>{
  document.querySelector('#event')!.textContent=`Home Assistant would open more info for ${(event as CustomEvent<{entityId:string}>).detail.entityId}.`;
});
