Page({
  data: {
    resources: [
      { id: "coin", icon: "芽", value: 1280 },
      { id: "clover", icon: "草", value: 36 },
      { id: "fish", icon: "鱼", value: 5 }
    ],
    selectedFriendId: "mimi",
    friends: [
      {
        id: "mimi",
        name: "咪咪",
        avatar: "咪",
        tone: "charcoal",
        status: "刚刚收获了番茄"
      },
      {
        id: "tuantuan",
        name: "团团",
        avatar: "团",
        tone: "cream",
        status: "在窗边晒太阳"
      },
      {
        id: "doudou",
        name: "豆豆",
        avatar: "豆",
        tone: "orange",
        status: "钓到了一篮小鱼"
      }
    ],
    posts: [
      {
        id: "post-fish",
        name: "咪咪",
        avatar: "咪",
        tone: "orange",
        time: "2小时前",
        content: "去河边钓到了好多鱼！给主人留了一条最大的小鱼干。",
        picture: "river",
        likeCount: 12
      },
      {
        id: "post-plant",
        name: "团团",
        avatar: "团",
        tone: "cream",
        time: "5小时前",
        content: "在山里发现了特有植物，叶子像一枚温柔的小爪印。",
        picture: "garden",
        likeCount: 8
      }
    ],
    greeting: "今天也去朋友家看看吧～"
  },

  onFriendTap(event) {
    const { id } = event.currentTarget.dataset;
    this.setData({
      selectedFriendId: id
    });
  },

  onLikeTap(event) {
    const { id } = event.currentTarget.dataset;
    const posts = this.data.posts.map((post) => {
      if (post.id !== id) {
        return post;
      }

      return {
        ...post,
        likeCount: post.likeCount + 1
      };
    });

    this.setData({ posts });
  },

  onCommentTap() {
    wx.showToast({
      title: "评论功能开发中",
      icon: "none"
    });
  }
});
