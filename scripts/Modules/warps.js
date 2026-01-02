import { system, world } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import modules from "./modules";

async function timer(plr, sec, msg, onFinish) {
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

class Warps {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.table('Warps')
        })
    }
    add(name, pos, dim) {
        if(this.db.findFirst({name})) return false;
        this.db.insertDocument({
            name,
            loc: {coords: pos, dim}
        })
        return true;
    }
    setLocation(id, pos, dim) {
        let loc = {coords: pos, dim}
        let doc = this.db.getByID(id)
        if(!doc) return false;
        doc.data.loc = loc
        this.db.overwriteDataByID(id, doc.data)
        return true;
    }
    del(id) {
        this.db.deleteDocumentByID(id)
    }
    setRequiredTag(id,requiredTag) {
        let doc = this.db.getByID(id);
        if(!doc) return false;
        doc.data.requiredTag = requiredTag
        this.db.overwriteDataByID(id, doc.data)
        return true;
    }
    async tp(plr,id) {
        let doc = this.db.getByID(id)
        if(!doc) return plr.sendMessage('Could not find warp');
        if(doc.data.requiredTag && !plr.hasTag(doc.data.requiredTag)) return plr.error('You do not have the required tag to teleport here!');
        await timer(plr,modules.get('warptime') ?? 5,'Teleporting in [s]..', () => {
            let dim = world.getDimension(`${doc.data.loc.dim}`)
            plr.teleport(doc.data.loc.coords, {dimension: dim})
            plr.success('Teleported successfully')
        })
    }
}

export default new Warps;