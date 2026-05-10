export const gamePresets = [
  {
    id: 'rpg',
    name: '⚔️ RPG Core Systems',
    desc: 'ระบบกระเป๋า, ต่อสู้, และติดตามเควส',
    json: JSON.stringify({
      "systemName": "RPG Core Systems (Inventory, Combat, Quest)",
      "nodes": [
        { "id": "g_inv", "type": "groupNode", "label": "📦 Inventory Module" },
        { "id": "inv_ui", "type": "featureNode", "parentId": "g_inv", "label": "หน้าต่าง UI กระเป๋า", "category": "UI", "tasks": ["สล็อต Grid 4x4", "ระบบแสดง Tooltip ไอเทม"] },
        { "id": "inv_db", "type": "featureNode", "parentId": "g_inv", "label": "ฐานข้อมูลกระเป๋า", "category": "Database", "tasks": ["บันทึก Array ไอเทมลง DB"] },
        
        { "id": "g_combat", "type": "groupNode", "label": "⚔️ Combat Module" },
        { "id": "combat_logic", "type": "featureNode", "parentId": "g_combat", "label": "คำนวณ Damage", "category": "Scripting", "tasks": ["สุ่มอัตรา Critical Hit", "หักเกราะป้องกัน (Armor)"] },
        { "id": "combat_sfx", "type": "featureNode", "parentId": "g_combat", "label": "เสียงต่อสู้", "category": "Sound", "tasks": ["เสียงฟันดาบ", "เสียงร้องตอนโดนโจมตี"] },
        
        { "id": "g_quest", "type": "groupNode", "label": "📜 Quest Module" },
        { "id": "quest_track", "type": "featureNode", "parentId": "g_quest", "label": "ตัวติดตามเควส", "category": "Scripting", "tasks": ["นับจำนวนมอนสเตอร์ที่กำจัด"] }
      ],
      "edges": [
        { "source": "inv_ui", "target": "inv_db", "actionLabel": "ซิงค์ข้อมูล" },
        { "source": "combat_logic", "target": "quest_track", "actionLabel": "ส่ง Event มอนสเตอร์ตาย" }
      ]
    }, null, 2)
  },
  {
    id: 'shop',
    name: '💰 Shop & Economy',
    desc: 'ระบบร้านค้า NPC และจัดการเงินตรา',
    json: JSON.stringify({
      "systemName": "ระบบร้านค้าและเศรษฐกิจ (Shop & Economy)",
      "nodes": [
        { "id": "g_econ", "type": "groupNode", "label": "💎 Economy Module" },
        { "id": "econ_curr", "type": "featureNode", "parentId": "g_econ", "label": "ระบบเงินตรา (Gold/Gems)", "category": "Database", "tasks": ["ฟังก์ชัน Add/Deduct เงิน", "ตรวจสอบป้องกันค่าติดลบ"] },
        
        { "id": "g_shop", "type": "groupNode", "label": "🛒 Shop Module" },
        { "id": "shop_ui", "type": "featureNode", "parentId": "g_shop", "label": "หน้าต่างร้านค้า NPC", "category": "UI", "tasks": ["ปุ่ม Buy / Sell", "ป้ายราคาสินค้า"] },
        { "id": "shop_net", "type": "featureNode", "parentId": "g_shop", "label": "ตรวจสอบธุรกรรม", "category": "Networking", "tasks": ["Validate ราคาจาก Server ป้องกันแฮก"] }
      ],
      "edges": [
        { "source": "shop_ui", "target": "shop_net", "actionLabel": "กดซื้อสินค้า" },
        { "source": "shop_net", "target": "econ_curr", "actionLabel": "หักเงินสำเร็จ" }
      ]
    }, null, 2)
  },
  {
    id: 'survival',
    name: '🥩 Survival Core',
    desc: 'ระบบหิว, สูตรคราฟต์, และวางโครงสร้างบ้าน',
    json: JSON.stringify({
      "systemName": "เกมแนวเอาชีวิตรอด (Survival Core)",
      "nodes": [
        { "id": "g_stats", "type": "groupNode", "label": "❤️ Survival Stats" },
        { "id": "stat_hunger", "type": "featureNode", "parentId": "g_stats", "label": "ระบบหิวน้ำ/อาหาร", "category": "Scripting", "tasks": ["ลดค่าตามเวลา (Tick)", "เมื่อค่าเหลือ 0 ให้หัก HP"] },
        
        { "id": "g_craft", "type": "groupNode", "label": "🪓 Crafting & Building" },
        { "id": "craft_recipe", "type": "featureNode", "parentId": "g_craft", "label": "สูตรผสมไอเทม", "category": "Database", "tasks": ["ตรวจสอบวัตถุดิบในกระเป๋า"] },
        { "id": "build_place", "type": "featureNode", "parentId": "g_craft", "label": "ระบบวางโครงสร้าง (Building)", "category": "Scripting", "tasks": ["Raycast ตรวจสอบพื้นที่วาง", "แสดงภาพพรีวิวสีเขียว/แดง"] }
      ],
      "edges": [
        { "source": "stat_hunger", "target": "craft_recipe", "actionLabel": "คราฟต์อาหารมากิน" }
      ]
    }, null, 2)
  },
  {
    id: 'fps',
    name: '🔫 FPS Gunplay & Net',
    desc: 'ระบบยิงปืน, เอฟเฟกต์, และ Hit Registration',
    json: JSON.stringify({
      "systemName": "เกมยิงมุมมองบุคคลที่หนึ่ง (FPS Core)",
      "nodes": [
        { "id": "g_gun", "type": "groupNode", "label": "🔫 Gunplay Module" },
        { "id": "gun_shoot", "type": "featureNode", "parentId": "g_gun", "label": "ระบบยิงปืน (Hitscan)", "category": "Scripting", "tasks": ["คำนวณ Recoil / กระสุนกระจาย", "หักกระสุนในแม็กกาซีน"] },
        { "id": "gun_sfx", "type": "featureNode", "parentId": "g_gun", "label": "เอฟเฟกต์ปืน", "category": "Art", "tasks": ["แสงปลายกระบอก (Muzzle Flash)", "เสียงปืนแบบ 3D Spatial"] },
        
        { "id": "g_netfps", "type": "groupNode", "label": "🌐 FPS Networking" },
        { "id": "net_hitreg", "type": "featureNode", "parentId": "g_netfps", "label": "ตรวจสอบการยิงโดน (Hit Reg)", "category": "Networking", "tasks": ["ระบบ Lag Compensation", "ส่งค่า Damage ไปหาเป้าหมาย"] }
      ],
      "edges": [
        { "source": "gun_shoot", "target": "gun_sfx", "actionLabel": "เล่นเอฟเฟกต์" },
        { "source": "gun_shoot", "target": "net_hitreg", "actionLabel": "ส่งพิกัดจุดที่ยิง" }
      ]
    }, null, 2)
  },
  {
    id: 'sim',
    name: '🌱 Simulation & AI',
    desc: 'ระบบเวลาโลก, ปลูกผัก, และตารางเวลา NPC',
    json: JSON.stringify({
      "systemName": "เกมจำลองสถานการณ์ (Simulation / Farm)",
      "nodes": [
        { "id": "g_world", "type": "groupNode", "label": "🌍 World Sim Module" },
        { "id": "sim_time", "type": "featureNode", "parentId": "g_world", "label": "ระบบเวลา (Day/Night)", "category": "Scripting", "tasks": ["คำนวณชั่วโมง/นาที", "เปลี่ยนสีท้องฟ้าตามเวลา"] },
        
        { "id": "g_farm", "type": "groupNode", "label": "🌱 Farming & AI" },
        { "id": "farm_crop", "type": "featureNode", "parentId": "g_farm", "label": "ระบบเติบโตของพืช", "category": "Scripting", "tasks": ["อัปเดตโมเดลพืชเมื่อข้ามวัน"] },
        { "id": "ai_npc", "type": "featureNode", "parentId": "g_farm", "label": "NPC ปัญญาประดิษฐ์", "category": "Scripting", "tasks": ["เดินตามตารางเวลา", "ระบบพูดคุย (Dialogue)"] }
      ],
      "edges": [
        { "source": "sim_time", "target": "farm_crop", "actionLabel": "ส่ง Event เปลี่ยนวัน" },
        { "source": "sim_time", "target": "ai_npc", "actionLabel": "สั่ง NPC เปลี่ยนกิจกรรม" }
      ]
    }, null, 2)
  }
];