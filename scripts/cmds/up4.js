const fs = require("fs");
const os = require("os");
const { createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "uptt",
    aliases: ["up4", "upt4"],
    version: "3.0",
    author: "Lawkey Marvelous",
    cooldowns: 5,
    role: 0,
    shortDescription: "Bot's system status",
    longDescription: "Show system info: uptime, RAM, CPU, load, platform server etc",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    try {
      const width = 1400;
      const height = 800;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, "#0d1a22");
      bgGradient.addColorStop(1, "#091015");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Card with glow (Glassmorphism)
      const cardX = 70, cardY = 70;
      const cardWidth = width - 140, cardHeight = height - 140;
      drawGlassCard(ctx, cardX, cardY, cardWidth, cardHeight, 30);

      // Title
      ctx.font = "bold 58px 'Segoe UI', sans-serif";
      const titleGradient = ctx.createLinearGradient(cardX, cardY, cardX + 500, cardY);
      titleGradient.addColorStop(0, "#00ffaa");
      titleGradient.addColorStop(1, "#00cc88");
      ctx.fillStyle = titleGradient;
      ctx.shadowColor = "#00ffaa88";
      ctx.shadowBlur = 20;
      ctx.fillText("Ichigo AI – System Monitor", cardX + 50, cardY + 50);
      ctx.shadowBlur = 0;

      // Sub divider
      ctx.strokeStyle = "#00ffaa22";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 50, cardY + 120);
      ctx.lineTo(cardX + cardWidth - 50, cardY + 120);
      ctx.stroke();

      // System data
      const uptime = process.uptime();
      const d = Math.floor(uptime / 86400);
      const h = Math.floor((uptime % 86400) / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = Math.floor(uptime % 60);
      const botUptime = `${d}d ${h}h ${m}m ${s}s`;

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const ramUsagePercent = totalMem > 0 ? (usedMem / totalMem) * 100 : 0;

      const cpus = os.cpus() || [];
      const cpuModel = cpus.length ? cpus[0].model : "Unknown";
      const cpuCount = cpus.length || 1;
      const loadAvg = os.loadavg ? os.loadavg()[0] : 0;
      const cpuPercent = Math.min((loadAvg / cpuCount) * 100, 100);

      const nodeVer = process.version;
      const platform = os.platform();
      const arch = os.arch();
      const hostname = os.hostname();

      const info = [
        ["⏱️ Uptime", botUptime],
        ["🧠 CPU", `${cpuModel} (${cpuCount} cores)`],
        ["📈 Load Avg", `${loadAvg.toFixed(2)} (${cpuPercent.toFixed(1)}%)`],
        ["💾 RAM", `${(usedMem / 1024 / 1024).toFixed(1)} MB / ${(totalMem / 1024 / 1024).toFixed(1)} MB (${ramUsagePercent.toFixed(1)}%)`],
        ["🛠️ Platform", `${platform} (${arch})`],
        ["Admin", `${botadmin}`]
        ["📦 Node", nodeVer],
        ["🔖 Host", hostname]
      ];

      // Render info
      let infoStartY = cardY + 150;
      info.forEach(([label, value], i) => {
        const y = infoStartY + i * 60;
        ctx.fillStyle = "#00ffaa";
        ctx.font = "bold 30px 'Segoe UI', sans-serif";
        ctx.fillText(label, cardX + 60, y);
        ctx.fillStyle = "#ffffffcc";
        ctx.font = "28px 'Segoe UI', sans-serif";
        ctx.fillText(value, cardX + 350, y);
      });

      // RAM Usage Bar
      drawProgressBar(
        ctx,
        cardX + 60,
        infoStartY + info.length * 60 + 40,
        cardWidth - 120,
        40,
        Math.max(0, Math.min(ramUsagePercent, 100)),
        "RAM Usage",
        "#00ffaa",
        "#003322"
      );

      // CPU Load Bar
      drawProgressBar(
        ctx,
        cardX + 60,
        infoStartY + info.length * 60 + 120,
        cardWidth - 120,
        40,
        Math.max(0, Math.min(cpuPercent, 100)),
        "CPU Load",
        "#ffaa00",
        "#332200"
      );

      // Timestamp
      ctx.font = "italic 22px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#77ffd2";
      ctx.fillText(`⏰ Generated: ${new Date().toLocaleString()}`, cardX + 60, height - 50);

      // Save Image
      const buffer = canvas.toBuffer("image/png");
      const fileName = `uptime_report_Lawkey_pro_${Date.now()}.png`;
      fs.writeFileSync(fileName, buffer);

      // Plain text version
      const plain = info.map(([l, v]) => `${l}: ${v}`).join("\n");
      const bar1 = `RAM Usage: ${ramUsagePercent.toFixed(1)}%`;
      const bar2 = `CPU Load: ${loadAvg.toFixed(2)} (${cpuPercent.toFixed(1)}%)`;

      // Send reply and clean up the generated file after sending
      await message.reply({
        body: `🔧 Lawkey AI – Uptime Report\n\n${plain}\n\n${bar1}\n${bar2}`,
        attachment: fs.createReadStream(fileName)
      });

      // Delay removal to ensure any streaming finishes on some platforms
      setTimeout(() => {
        fs.unlink(fileName, (err) => {
          if (err) {
            // best-effort cleanup; don't throw
            // console.error(`Failed to remove temporary file ${fileName}:`, err);
          }
        });
      }, 5000);

    } catch (err) {
      // send an error message, but don't crash the bot
      try {
        await message.reply({ body: `❌ Failed to generate uptime report, Lawkey will fix later, console says: ${err.message}` });
      } catch (e) {
        // ignore
      }
    }
  }
};

// Draw rounded glass card
function drawGlassCard(ctx, x, y, w, h, r) {
  ctx.shadowColor = "#00ffaa33";
  ctx.shadowBlur = 30;
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  roundRect(ctx, x, y, w, h, r, true, false);

  // subtle inner highlight
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x + 1, y + 1, w - 2, h / 4, { tl: r, tr: r, br: 0, bl: 0 }, true, false);
  ctx.restore();

  ctx.shadowBlur = 0;
}

// Draw glowing progress bar
function drawProgressBar(ctx, x, y, w, h, percent, label, fillColor, bgColor) {
  // background
  ctx.fillStyle = bgColor;
  roundRect(ctx, x, y, w, h, 20, true, false);

  // clamp fill width
  const clamped = Math.max(0, Math.min(percent, 100));
  const fillW = (clamped / 100) * w;

  // gradient for fill
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, fillColor);
  // darker stop derived from fill color if possible
  grad.addColorStop(1, shadeColor(fillColor, -30) || "#003322");
  ctx.fillStyle = grad;

  ctx.shadowColor = hexToRgba(fillColor, 0.4);
  ctx.shadowBlur = 20;
  roundRect(ctx, x, y, fillW, h, 20, true, false);
  ctx.shadowBlur = 0;

  // label text on top
  ctx.fillStyle = "#ffffffcc";
  ctx.font = "bold 24px 'Segoe UI', sans-serif";
  ctx.fillText(`${label}: ${clamped.toFixed(1)}%`, x + 20, y + h / 2 + 8);
}

// RoundRect helper
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof r === "number") r = { tl: r, tr: r, br: r, bl: r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Utility: convert hex color (e.g. "#00ffaa") to rgba string with alpha
function hexToRgba(hex, alpha = 1) {
  try {
    const h = hex.replace("#", "");
    const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  } catch (e) {
    return `rgba(0,0,0,${alpha})`;
  }
}

// Utility: simple shade function to darken or lighten hex color
function shadeColor(hex, percent) {
  try {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const num = parseInt(h, 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
  } catch (e) {
    return null;
  }
}