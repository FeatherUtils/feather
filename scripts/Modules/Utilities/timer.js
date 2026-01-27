import { system } from '@minecraft/server'
import modules from '../modules'

async function timer(plr, sec, msg, onFinish) {
  if(modules.get('CLogTeleportDisabled') && plr.hasTag('combat')) return plr.error('Teleporting is not allowed in combat')
  const startLoc = {
    x: Math.floor(plr.location.x),
    y: Math.floor(plr.location.y),
    z: Math.floor(plr.location.z),
  };

  for (let i = sec; i > 0; i--) {
    plr.sendMessage(msg.replace("[s]", i));

    for (let check = 0; check < 10; check++) {
      await system.waitTicks(2);

      if (!plr) return;
      const currentLoc = {
          x: Math.floor(plr.location.x),
          y: Math.floor(plr.location.y),
          z: Math.floor(plr.location.z),
      };
      if (!currentLoc) return;
        
        const moved =
         currentLoc.x !== startLoc.x ||
        currentLoc.y !== startLoc.y ||
         currentLoc.z !== startLoc.z;

      if(moved) {
        plr.sendMessage("§cTimer cancelled due to movement!");
        return;
    }
    }
  }

  plr.sendMessage(msg.replace("[s]", 0));

  if (typeof onFinish === "function") {
    onFinish(plr);
  }
}

export { timer };