export const questions = [
  {
    id: 1,
    silhouette: '/images/1.png',
    answer: '愛因斯坦', // 範例，確保是4個字
  },
  {
    id: 2,
    silhouette: '/images/2.png',
    answer: '切格瓦拉', // 剛好4個字
  },
  {
    id: 3,
    silhouette: '/images/3.png',
    answer: '希特勒', // 剛好4個字
  },
  {
    id: 4,
    silhouette: '/images/4.png',
    answer: '孔子',
  },
  {
    id: 5,
    silhouette: '/images/5.png',
    answer: '甘地', // 超過4個字
   
  },
  {
    id: 6,
    silhouette: '/images/6.png',
    answer: '拿破崙', // 範例4字答案
  },
  {
    id: 7,
    silhouette: '/images/7.png',
    answer: '豬哥亮', // 剛好4個字
  },
  // ... 確保所有答案都是4個字
];

export const getGameQuestions = (count = 7) => {
  // 如果要隨機選題
  //const shuffled = [...questions].sort(() => 0.5 - Math.random());
  //return shuffled.slice(0, count);
  // 如果固定就是用 questions 陣列定義好的前 count 題
  return questions.slice(0, count);
};