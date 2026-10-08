/* 文件：shezhi.js（设置）
   这是以后最常修改的文件。直接改中文题目、金币数字、商品价格即可。
   answer 从 0 开始：0 是第一个答案、1 是第二个、2 是第三个。
*/
window.SHEZHI = {
  mingzi: '慢慢冒险',
  chushi: 2000,         // 新玩家一开始有多少金币
  qiandao: 100,         // 每次签到金币
  dati: 100,            // 每日答题金币
  xiaoshi: 6,           // 打猎要等待几个小时
  zuishao: 50,          // 打猎最少金币
  zuiduo: 200,          // 打猎最多金币
  liwu: 0.4,            // 0.4 = 40% 几率带回礼物
  timu: [
    { question:'【示例】我最喜欢怎样度过周末？', options:['和家人一起吃饭','去上班','整理文件'], answer:0 },
    { question:'【示例】我出门旅游最喜欢带什么？', options:['一本字典','一台相机','一盆花'], answer:1 },
    { question:'【示例】哪句话让我最开心？', options:['开始加班','又有会议','今晚一起吃饭'], answer:2 },
    { question:'【示例】我最喜欢收到什么小礼物？', options:['家人的手写卡片','工作报表','闹钟'], answer:0 }
  ]
};

/* 商品清单：name 是显示的名字；price 是售价；hint 是介绍。
   id、type 最好别改，它们负责让衣柜正确找到服装。
   type: outfit=衣服、hat=帽子、glasses=眼镜、accessory=配饰。
*/
window.WUPIN = [
  {id:'plain-dress',name:'小白裙',type:'outfit',price:0,hint:'初始服装',symbol:'♡',starter:true},
  {id:'striped-dress',name:'条纹连衣裙',type:'outfit',price:250,hint:'一笔一笔画出来的',symbol:'≋'},
  {id:'star-dress',name:'星星连衣裙',type:'outfit',price:360,hint:'藏着三颗小星星',symbol:'☆'},
  {id:'bunny-hoodie',name:'兔兔连帽衫',type:'outfit',price:480,hint:'毛茸茸的小兔',symbol:'♧'},
  {id:'raincoat',name:'下雨天外套',type:'outfit',price:420,hint:'适合踩水坑',symbol:'☂'},
  {id:'beret',name:'小贝雷帽',type:'hat',price:180,hint:'有点文艺',symbol:'◒'},
  {id:'top-hat',name:'魔术高帽',type:'hat',price:300,hint:'会变魔术吗',symbol:'♠'},
  {id:'party-hat',name:'生日尖帽',type:'hat',price:220,hint:'每天像生日',symbol:'△'},
  {id:'crown',name:'纸片皇冠',type:'hat',price:680,hint:'今天你是主角',symbol:'♛'},
  {id:'round-glasses',name:'圆圆眼镜',type:'glasses',price:160,hint:'聪明加倍',symbol:'◎'},
  {id:'square-glasses',name:'方框眼镜',type:'glasses',price:200,hint:'一本正经',symbol:'▣'},
  {id:'sunglasses',name:'酷酷墨镜',type:'glasses',price:320,hint:'酷酷的一天',symbol:'◕'},
  {id:'scarf',name:'软软围巾',type:'accessory',price:140,hint:'温暖的拥抱',symbol:'〰'},
  {id:'bowtie',name:'蝴蝶领结',type:'accessory',price:190,hint:'出门正式点',symbol:'⋈'},
  {id:'crossbag',name:'斜挎小包',type:'accessory',price:260,hint:'装一点糖果',symbol:'▢'},
  {id:'heart-pin',name:'爱心胸针',type:'accessory',price:150,hint:'把爱带身上',symbol:'♡'}
];
