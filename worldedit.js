(function() {
  const plugin = PluginAPI.createPlugin("miniedit_mod");

  let selections = {};
  let clipboard = {};
  let history = {};

  function getRegion(player) {
    const sel = selections[player.uuid];
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

  plugin.onCommand("wand", function(player) {
    player.giveItem("wooden_axe", 1);
    player.sendMessage("MiniEdit wand given.");
  });

  plugin.onBlockClick("wooden_axe", function(player, block, face) {
    if (!selections[player.uuid]) selections[player.uuid] = {};
    const sel = selections[player.uuid];
    if (!sel.pos1) {
      sel.pos1 = block.position;
      player.sendMessage("Position 1 set.");
    } else {
      sel.pos2 = block.position;
      player.sendMessage("Position 2 set.");
    }
  });

  plugin.onCommand("set", function(player, args) {
    const region = getRegion(player);
    if (!region) return player.sendMessage("Select two positions first.");
    const blockType = args[0];
    history[player.uuid] = [];
    for (let x = region.x1; x <= region.x2; x++) {
      for (let y = region.y1; y <= region.y2; y++) {
        for (let z = region.z1; z <= region.z2; z++) {
          const pos = { x, y, z };
          history[player.uuid].push({ pos, old: player.getBlock(pos) });
          player.setBlock(pos, blockType);
        }
      }
    }
    player.sendMessage(`Region set to ${blockType}.`);
  });

  plugin.onCommand("undo", function(player) {
    const hist = history[player.uuid];
    if (!hist) return player.sendMessage("Nothing to undo.");
    for (const entry of hist) {
      player.setBlock(entry.pos, entry.old);
    }
    delete history[player.uuid];
    player.sendMessage("Undo complete.");
  });

  plugin.register();
})();
