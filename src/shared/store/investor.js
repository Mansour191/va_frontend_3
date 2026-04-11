import { defineStore } from 'pinia';

export const useInvestorStore = defineStore('investor', {
  state: () => ({
    draftDesigns: [
      { id: 1, title: 'عروق خضراء ملكية', image: 'https://i.postimg.cc/0QKmBBJ9/kitchen2.png', votes: 12, description: 'تصميم رخامي فاخر بعروق خضراء عميقة' },
      { id: 2, title: 'أسود ملكي مطفي', image: 'https://i.postimg.cc/7L0DfPgY/Entrance1.png', votes: 8, description: 'رخام أسود فخم بلمسة مطفية عصرية' },
      { id: 3, title: 'ذهبي كلاسيكي', image: 'https://i.postimg.cc/htCcH3cZ/table1.png', votes: 15, description: 'تصميم يجمع بين بياض الثلج وعروق الذهب' },
    ],
    votedDesignIds: JSON.parse(localStorage.getItem('votedDesignIds')) || [],
    kpis: {
      salesGrowth: 25,
      catalogProgress: 38, // Target 50
      totalRevenue: 1500000,
      activeInvestors: 5
    },
    regionalStats: [
      { state: 'الجزائر', value: 450 },
      { state: 'وهران', value: 320 },
      { state: 'قسنطينة', value: 280 },
      { state: 'سطيف', value: 210 },
      { state: 'عنابة', value: 190 }
    ]
  }),
  actions: {
    voteForDesign(designId) {
      if (this.votedDesignIds.includes(designId)) return;
      
      const design = this.draftDesigns.find(d => d.id === designId);
      if (design) {
        design.votes++;
        this.votedDesignIds.push(designId);
        localStorage.setItem('votedDesignIds', JSON.stringify(this.votedDesignIds));
      }
    }
  }
});
