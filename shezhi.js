/* shezhi.js = 设置：以后主要修改这个文件。
   price：价格；hint：搞笑说明；symbol：商品小图标；color：商品卡片点缀色。
   id 和 type 关乎存档、换装，请不要随便改。
   type 只有 hair / top / pants / hat / face 五种。
*/
window.SHEZHI = {
  mingzi: 'Game1028 · 摸鱼宇宙',
  chushi: 0,       // 第一次打开游戏的金币
  qiandao: 100,       // 签到奖励
  dati: 100,          // 答题奖励
  xiaoshi: 6,         // 打猎时间（小时）
  zuishao: 50,        // 打猎金币最低
  zuiduo: 200,       // 打猎金币最高
  liwu: 0.40,        // 打猎捡到礼物的概率
  // 每天展示一道从未出过的题；题库全部出完则等待你添加新题。
  // 直接在下面继续追加 {question:'...', options:['...','...','...'], answer:0} 即可。
  // answer 为正确答案的位置：0=第一项，1=第二项，2=第三项。
  // 同一道题请不要修改 question 文本，否则程序会把它当作新题。
  // 如果经常需要修改题目，可单独加 id:'ti-001' 这样的固定编号。
  timu: [
    { question:'我在读什么专业', options:['创造策划','策展制作','创意策划'], answer:0 },
    { question:'我在家附近最常吃什么', options:['意面','披萨','焗饭'], answer:1 },
    { question:'我喜欢的颜色是', options:['红色','黄色','蓝色'], answer:2 },
    { question:'我喜欢打什么游戏', options:['王者荣耀','第五人格','瓦罗兰特'], answer:1 }
  ]
};

/* 50 个道具；每类 10 个。starter=true 是自带的初始衣物。
   发型 ID 的末尾 black/brown 代表黑色/浅冷棕色。
   商店每天只随机展示 4 件；打猎可能额外带回任意未拥有道具。
*/
window.WUPIN = [
  // ——— 发型：五种造型 × 两种发色 ———
  {id:'hair-pony-black',type:'hair',name:'黑色·齐刘海马尾',price:0,hint:'素颜也要有主角BGM。',symbol:'🎀',color:'#202024',starter:true},
  {id:'hair-straight-black',type:'hair',name:'黑色·齐刘海长直发',price:120,hint:'一甩头，风都要排队。',symbol:'🖤',color:'#25252b'},
  {id:'hair-twin-black',type:'hair',name:'黑色·齐刘海双马尾',price:120,hint:'双倍可爱，双倍叛逆。',symbol:'🎀',color:'#25252b'},
  {id:'hair-side-black',type:'hair',name:'黑色·斜刘海披肩长发',price:120,hint:'三分慵懒七分装酷。',symbol:'🌙',color:'#25252b'},
  {id:'hair-wolf-black',type:'hair',name:'黑色·M字刘海狼尾短发',price:120,hint:'今天不帅，算我输。',symbol:'🐺',color:'#25252b'},
  {id:'hair-pony-brown',type:'hair',name:'浅冷棕·齐刘海马尾',price:180,hint:'温柔是假的，想吃是真的。',symbol:'🎀',color:'#ab8c83'},
  {id:'hair-straight-brown',type:'hair',name:'浅冷棕·齐刘海长直发',price:180,hint:'洗头钱已计入造型费。',symbol:'🍂',color:'#ab8c83'},
  {id:'hair-twin-brown',type:'hair',name:'浅冷棕·齐刘海双马尾',price:180,hint:'甜度超标，请勿靠近。',symbol:'🍮',color:'#ab8c83'},
  {id:'hair-side-brown',type:'hair',name:'浅冷棕·斜刘海披肩长发',price:180,hint:'路过的风都想合影。',symbol:'☕',color:'#ab8c83'},
  {id:'hair-wolf-brown',type:'hair',name:'浅冷棕·M字刘海狼尾短发',price:520,hint:'小狼尾，大野心。',symbol:'🐺',color:'#ab8c83'},

  // ——— 上衣：5 件指定款 + 5 件潮流华丽款 ———
  {id:'top-white',type:'top',name:'白T恤',price:0,hint:'默认皮肤，靠脸硬撑。',symbol:'👕',color:'#fafafa',starter:true},
  {id:'top-punk',type:'top',name:'黑色朋克长袖T恤',price:250,hint:'今晚我的KPI是摇滚。',symbol:'🎸',color:'#242428'},
  {id:'top-pink',type:'top',name:'粉色萌萌蕾丝泡泡袖',price:310,hint:'萌到让老板不敢催我。',symbol:'🩷',color:'#f8adcf'},
  {id:'top-duck',type:'top',name:'小黄鸭嘎嘎上衣',price:280,hint:'嘎嘎两声，拒绝内耗。',symbol:'🐥',color:'#ffd955'},
  {id:'top-gray',type:'top',name:'灰色休闲老头衫',price:200,hint:'时尚的尽头是小区散步。',symbol:'🩶',color:'#a9a9ac'},
  {id:'top-racer',type:'top',name:'烈焰红黑赛车夹克',price:580,hint:'不飙车，只飙气场。',symbol:'🏎️',color:'#e95254'},
  {id:'top-tech',type:'top',name:'霓虹拼色机能外套',price:650,hint:'穿上像能黑进冰箱。',symbol:'⚡',color:'#6ad4e8'},
  {id:'top-sequin',type:'top',name:'星光银色亮片短上衣',price:740,hint:'路灯都得叫我前辈。',symbol:'✨',color:'#c7c9df'},
  {id:'top-purple',type:'top',name:'紫罗兰蝴蝶结衬衫',price:620,hint:'一边优雅一边偷吃蛋糕。',symbol:'💜',color:'#bba1ed'},
  {id:'top-velvet',type:'top',name:'孔雀蓝丝绒短西装',price:820,hint:'开会像要去领电影大奖。',symbol:'🦚',color:'#248b9f'},

  // ——— 裤子：5 件指定款 + 5 件潮流华丽款 ———
  {id:'pants-black',type:'pants',name:'黑色长裤',price:0,hint:'默认装备，百搭不翻车。',symbol:'🖤',color:'#35363c',starter:true},
  {id:'pants-jeans',type:'pants',name:'蓝色牛仔裤',price:240,hint:'休闲到可以去吃第三顿。',symbol:'👖',color:'#6c95d9'},
  {id:'pants-white',type:'pants',name:'白色飘飘阔腿裤',price:350,hint:'走路自带八级微风。',symbol:'🤍',color:'#f5f4ef'},
  {id:'pants-pink',type:'pants',name:'粉色萌萌泡泡中裤',price:310,hint:'裤腿蓬松，烦恼清空。',symbol:'🩷',color:'#efb8d4'},
  {id:'pants-gray',type:'pants',name:'灰色休闲大裤衩',price:210,hint:'出门三分钟，舒适一整天。',symbol:'🩶',color:'#a2a3a8'},
  {id:'pants-cargo',type:'pants',name:'暗夜多口袋机能裤',price:510,hint:'十二个兜，一个也没钱。',symbol:'⛓️',color:'#383941'},
  {id:'pants-flare',type:'pants',name:'紫色渐变喇叭长裤',price:560,hint:'下楼像在走音乐节红毯。',symbol:'💜',color:'#9772dc'},
  {id:'pants-silver',type:'pants',name:'未来感银色降落伞裤',price:690,hint:'不是宇航员但要上天。',symbol:'🪩',color:'#b7c2d3'},
  {id:'pants-plaid',type:'pants',name:'樱桃红格纹锥形裤',price:480,hint:'叛逆得很有礼貌。',symbol:'🍒',color:'#d65a6d'},
  {id:'pants-galaxy',type:'pants',name:'午夜星河刺绣长裤',price:780,hint:'裤腿上有一个小宇宙。',symbol:'🌌',color:'#33355c'},

  // ——— 帽子与头饰 ———
  {id:'hat-beret',type:'hat',name:'黑色贝雷帽',price:250,hint:'今天我是巴黎街头NPC。',symbol:'🖤',color:'#27272a'},
  {id:'hat-cap',type:'hat',name:'灰色鸭舌帽',price:190,hint:'遮阳，也遮没睡醒的脸。',symbol:'🧢',color:'#989ba2'},
  {id:'hat-ducks',type:'hat',name:'双鸭鸭头箍',price:360,hint:'左嘎右嘎，立体环绕音效。',symbol:'🐥',color:'#ffdb55'},
  {id:'hat-bows',type:'hat',name:'双粉萌萌蝴蝶结',price:340,hint:'双马尾专属氛围组，也能乱搭。',symbol:'🎀',color:'#ff9dc9'},
  {id:'hat-bucket',type:'hat',name:'樱桃红渔夫帽',price:320,hint:'不钓鱼，只钓赞美。',symbol:'🍒',color:'#c54250'},
  {id:'hat-cat',type:'hat',name:'薰衣草猫耳发箍',price:310,hint:'喵一声就不算迟到。',symbol:'🐱',color:'#b6a0eb'},
  {id:'hat-crown',type:'hat',name:'银色星星小皇冠',price:790,hint:'王室编外摸鱼成员。',symbol:'👑',color:'#c7ceda'},
  {id:'hat-pearl',type:'hat',name:'珍珠光环发箍',price:530,hint:'头顶自带人间滤镜。',symbol:'🫧',color:'#eee5dd'},
  {id:'hat-beanie',type:'hat',name:'云朵蓝针织毛线帽',price:370,hint:'脑袋保暖，想法不保守。',symbol:'☁️',color:'#8bbddf'},
  {id:'hat-mini',type:'hat',name:'祖母绿迷你礼帽',price:680,hint:'正式得像要给猫颁奖。',symbol:'🎩',color:'#388b79'},

  // ——— 面饰：包含普通眼镜、创意眼镜和脸部装饰 ———
  {id:'face-round',type:'face',name:'圆框眼镜',price:170,hint:'智商+100，视力另说。',symbol:'👓',color:'#c69d60'},
  {id:'face-square',type:'face',name:'方框眼镜',price:190,hint:'看起来很会做Excel。',symbol:'👓',color:'#33363c'},
  {id:'face-sun',type:'face',name:'黑超墨镜',price:290,hint:'别问，问就是巨星。',symbol:'🕶️',color:'#222326'},
  {id:'face-rimless',type:'face',name:'金丝无框眼镜',price:390,hint:'像很会投资，其实不会。',symbol:'✨',color:'#d0aa65'},
  {id:'face-cyber',type:'face',name:'霓虹赛博窄框镜',price:460,hint:'未来已到，作业没写。',symbol:'⚡',color:'#56d6e1'},
  {id:'face-heart',type:'face',name:'粉红爱心眼镜',price:440,hint:'恋爱脑启动，理智退出。',symbol:'💗',color:'#f38eaa'},
  {id:'face-star',type:'face',name:'金色星星眼镜',price:480,hint:'眨一下眼，就能上热搜。',symbol:'⭐',color:'#f1c95b'},
  {id:'face-monocle',type:'face',name:'复古单片绅士镜',price:410,hint:'审视世界，然后点外卖。',symbol:'🧐',color:'#baa27c'},
  {id:'face-patch',type:'face',name:'小海盗星星眼罩',price:330,hint:'左眼看世界，右眼睡懒觉。',symbol:'🏴‍☠️',color:'#2b2c32'},
  {id:'face-cat',type:'face',name:'紫金猫眼镜',price:520,hint:'美貌锋利，请保持距离。',symbol:'🐈',color:'#a57bc7'}
];