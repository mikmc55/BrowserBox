import {DEBUG} from '../common.js';
// returns a promise that eventually resolve to true if puter ability is detected. It never rejects
// and does not resolve until puter ability is detected.
export default async function untilPuterAbility() {
  let resolve;
  const pr = new Promise(res => resolve = res);
  globalThis.addEventListener('message', ({data, origin, source}) => {
    const uri = new URL(origin);
    if ( !uri.hostname.endsWith('puter.site') ) return;
    if ( !data.response ) return;

    if ( data.response.hasPuterAbility >= 0 ) {
      globalThis.hasPuterAbility = true;
      resolve(true);
    }
  });
  DEBUG.debugPuterAbility && console.log(`browser context sending request for info on puter ability to puter context`);
  globalThis.parent.parent.postMessage({request:{hasPuterAbility: 0}}, '*');
  return pr;
}

export async function handlePuterAbility(meta, state) {
  DEBUG.debugPuterAbility && console.log(`browser context received meta event`, meta, state);
  if ( meta.hasPuterAbility ) {
    if ( ! globalThis.hasPuterAbility ) {
      // throw it up the chain
      DEBUG.debugPuterAbility && console.log(`browser context sending request for info on puter ability to puter context`);
      globalThis.parent.parent.postMessage({request:{hasPuterAbility:0}}, '*');
    } else {
      // push it back down with the answer
      state.execute(`globalThis.puterAbilityConfirmed = true;`, {contextId: meta.executionContextId});       
    }
  }
  if ( meta.puterCustomDownload ) {
    // throw it up the chain
    DEBUG.debugPuterAbility && console.log(`browser context sending notification of intended download to puter to puter context`);
    globalThis.parent.parent.postMessage({request:{...meta}}, '*');
  }
}