/* 文件：shezhi.js（设置）
   这是以后最常修改的文件。直接改中文题目、金币数字、商品价格即可。
   answer 从 0 开始：0 是第一个答案、1 是第二个、2 是第三个。
*/
window.SHEZHI = {
  mingzi: '慢慢冒险',
  chushi: 0,         // 新玩家一开始有多少金币
  qiandao: 88,         // 每次签到金币
  dati: 100,            // 每日答题金币
  xiaoshi: 3,           // 打猎要等待几个小时
  zuishao: 50,          // 打猎最少金币
  zuiduo: 200,          // 打猎最多金币
  liwu: 0.4,            // 0.4 = 40% 几率带回礼物
  timu: [
    { question:'我在读什么专业', options:['创造策划','策展制作','创意策划'], answer:0 },
    { question:'我在家附近最常吃什么', options:['意面','披萨','焗饭'], answer:1 },
    { question:'我喜欢的颜色是', options:['红色','黄色','蓝色'], answer:2 },
    { question:'我喜欢打什么游戏', options:['王者荣耀','第五人格','瓦罗兰特'], answer:1 }
  ]
};

/* 商品清单：name 是显示的名字；price 是售价；hint 是介绍。
   id、type 最好别改，它们负责让衣柜正确找到服装。
   type: outfit=衣服、hat=帽子、glasses=眼镜、accessory=配饰。
*/
window.WUPIN = [
  {id:'plain-dress',name:'白裙',type:'outfit',price:0,hint:'初始服装',symbol:'♡',starter:true},
  {id:'striped-dress',name:'条纹连衣裙',type:'outfit',price:80,hint:'这是一件条纹纹',symbol:'≋'},
  {id:'star-dress',name:'星星连衣裙',type:'outfit',price:120,hint:'一闪一闪小星星',symbol:'☆'},
  {id:'bunny-hoodie',name:'兔兔连帽衫',type:'outfit',price:220,hint:'毛茸茸之雷霆兔',symbol:'♧'},
  {id:'raincoat',name:'雨天外套',type:'outfit',price:280,hint:'踩水坑踩踩踩',symbol:'☂'},
  {id:'beret',name:'小贝雷帽',type:'hat',price:80,hint:'文艺女王来了',symbol:'◒'},
  {id:'top-hat',name:'魔术高帽',type:'hat',price:80,hint:'魔术大师一位',symbol:'♠'},
  {id:'party-hat',name:'生日尖帽',type:'hat',price:80,hint:'雷霆生日王',symbol:'△'},
  {id:'crown',name:'纸片皇冠',type:'hat',price:100,hint:'女皇驾到',symbol:'♛'},
  {id:'round-glasses',name:'圆圆眼镜',type:'glasses',price:120,hint:'圆圆眼镜镜',symbol:'◎'},
  {id:'square-glasses',name:'方框眼镜',type:'glasses',price:120,hint:'方框眼镜镜',symbol:'▣'},
  {id:'sunglasses',name:'装逼墨镜',type:'glasses',price:150,hint:'装逼墨镜镜',symbol:'◕'},
  {id:'scarf',name:'围巾',type:'accessory',price:120,hint:'看起来很软的围巾',symbol:'〰'},
  {id:'bowtie',name:'蝴蝶领结',type:'accessory',price:80,hint:'会是个变声器吗',symbol:'⋈'},
  {id:'crossbag',name:'斜挎小包',type:'accessory',price:120,hint:'中看不中用',symbol:'▢'},
  {id:'heart-pin',name:'爱心胸针',type:'accessory',price:80,hint:'胸针一枚搭配大师',symbol:'♡'}
];
