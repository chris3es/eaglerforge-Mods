class MiniEdit {
  constructor() {
    this.selections = {};
    this.history = {};
    this.registerEvents();
  }

  registerEvents() {
    ModAPI.addEventListener("sendchatmessage", (ev) => {
      const msg = ev.message.trim();
      const player = ModAPI.getProfileName();

      if (msg === ".wand") {
        ModAPI.displayToChat({ msg: "MiniEdit> Wand activated. Use left/right click to select positions." });
        ev.preventDefault = true;
      }

      if (msg.startsWith(".set ")) {
        const block = msg.split(" ")[1];
        this.setRegion(player, block);
        ev.preventDefault = true;
      }

      if (msg === ".undo") {
        this.undo(player);
        ev.preventDefault = true;
      }
    });

    ModAPI.addEventListener("blockclick", (ev) => {
      const player = ModAPI.getProfileName();
      if (!this.selections[player]) this.selections[player] = {};

      const sel = this.selections[player];
      if (!sel.pos1) {
        sel.pos1 = ev.blockPos;
        ModAPI.displayToChat({ msg: "MiniEdit> Position 1 set." });
      } else {
        sel.pos2 = ev.blockPos;
        ModAPI.displayToChat({ msg: "MiniEdit> Position 2 set." });
      }
    });
  }

  getRegion(player) {
    const sel = this.selections[player];
    if (!sel || !sel.pos1 || !sel.pos2) return null;
    return {
      x1: Math.min(sel.pos1.x, sel.pos2.x),
      y1: Math.min(sel.pos1.y, sel.pos2.y),
      z1: Math.min(sel.pos1.z, sel.pos2.z),
      x2: Math.max(sel.pos1.x, sel.pos2.x),
      y2: Math.max(sel.pos1.y, sel.pos2.y),
      z2: Math.max(sel.pos1.z, sel.pos2.z)
    };
  }

  setRegion(player, blockType) {
    const region = this.getRegion(player);
    if (!region) {
      ModAPI.displayToChat({ msg: "MiniEdit> Select two positions first." });
      return;
    }

    this.history[player] = [];

    for (let x = region.x1; x <= region.x2; x++) {
      for (let y = region.y1; y <= region.y2; y++) {
        for (let z = region.z1; z <= region.z2; z++) {
          const pos = { x, y, z };
          const oldBlock = ModAPI.getBlock(pos);
          this.history[player].push({ pos, old: oldBlock });
          ModAPI.setBlock(pos, blockType);
        }
      }
    }

    ModAPI.displayToChat({ msg: `MiniEdit> Region set to ${blockType}.` });
  }

  undo(player) {
    const hist = this.history[player];
    if (!hist || hist.length === 0) {
      ModAPI.displayToChat({ msg: "MiniEdit> Nothing to undo." });
      return;
    }

    for (const entry of hist) {
      ModAPI.setBlock(entry.pos, entry.old);
    }

    delete this.history[player];
    ModAPI.displayToChat({ msg: "MiniEdit> Undo complete." });
  }
}

new MiniEdit();
