const SOCIAL_COMMENTS_STORAGE_KEY = "catHouseSocialMyComments";

Page({
  data: {
    resources: [
      { icon: "🌱", label: "芽币", value: 1280 },
      { icon: "☘️", label: "幸运草", value: 36 },
      { icon: "🐟", label: "小鱼干", value: 5 },
    ],
    selectedFriendId: "all",
    selectedFriendName: "全部猫友",
    friends: [
      { id: "all", name: "全部", avatar: "🐾", status: "猫友圈", color: "#f8d57e" },
      { id: "mimi", name: "咪咪", avatar: "🐱", status: "钓到鱼", color: "#f4c987" },
      { id: "tuantuan", name: "团团", avatar: "😺", status: "晒太阳", color: "#dfe9a8" },
      { id: "doudou", name: "豆豆", avatar: "🐈", status: "发现花", color: "#f7d9b9" },
      { id: "buding", name: "布丁", avatar: "😽", status: "写日记", color: "#cde6c0" },
      { id: "naitang", name: "奶糖", avatar: "🐈‍⬛", status: "午睡中", color: "#e8d8bd" },
      { id: "huajuan", name: "花卷", avatar: "😸", status: "浇白菜", color: "#f4c5b3" },
    ],
    posts: [
      {
        id: "p1",
        friendId: "mimi",
        name: "咪咪",
        avatar: "🐱",
        color: "#f4c987",
        content: "去河边钓到了好多鱼！准备带一条给小橘尝尝。",
        time: "2 小时前",
        likes: 12,
        comments: 3,
        commentList: [
          { id: "p1-c1", author: "小橘", text: "鱼看起来好新鲜！", mine: false },
          { id: "p1-c2", author: "团团", text: "下次一起去河边。", mine: false },
        ],
        liked: false,
        scene: "river",
        image: "/assets/social/post-river.png",
      },
      {
        id: "p2",
        friendId: "tuantuan",
        name: "团团",
        avatar: "😺",
        color: "#dfe9a8",
        content: "在山上发现了稀有植物，叶子像一枚小小幸运草。",
        time: "5 小时前",
        likes: 8,
        comments: 2,
        commentList: [
          { id: "p2-c1", author: "豆豆", text: "这片叶子好像幸运草。", mine: false },
        ],
        liked: false,
        scene: "hill",
        image: "/assets/social/post-hill.png",
      },
      {
        id: "p3",
        friendId: "doudou",
        name: "豆豆",
        avatar: "🐈",
        color: "#f7d9b9",
        content: "窗台的花今天开了，晒到太阳的小窝特别舒服。",
        time: "昨天 10:15",
        likes: 15,
        comments: 4,
        commentList: [
          { id: "p3-c1", author: "咪咪", text: "阳光看起来好舒服。", mine: false },
          { id: "p3-c2", author: "花卷", text: "想去你家窗台坐坐。", mine: false },
        ],
        liked: true,
        scene: "garden",
        image: "/assets/social/post-garden.png",
      },
      {
        id: "p4",
        friendId: "buding",
        name: "布丁",
        avatar: "😽",
        color: "#cde6c0",
        content: "写了一张便签：好朋友的鼓励也会变成能量。",
        time: "昨天 16:40",
        likes: 9,
        comments: 1,
        commentList: [
          { id: "p4-c1", author: "小橘", text: "这句话我记下啦。", mine: false },
        ],
        liked: false,
        scene: "desk",
        image: "/assets/social/post-desk.png",
      },
    ],
    visiblePosts: [],
    commentPanelVisible: false,
    activePostId: "",
    activePostName: "",
    commentDraft: "",
    previewVisible: false,
    previewImage: "",
  },

  onLoad() {
    this.restoreMyComments();
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack();
      return;
    }
    wx.redirectTo({ url: "/pages/house/house" });
  },

  selectFriend(event) {
    const id = event.currentTarget.dataset.id;
    this.refreshVisiblePosts(id);
  },

  refreshVisiblePosts(id) {
    const friend = this.data.friends.find((item) => item.id === id) || this.data.friends[0];
    const visiblePosts = id === "all"
      ? this.data.posts
      : this.data.posts.filter((post) => post.friendId === id);

    this.setData({
      selectedFriendId: id,
      selectedFriendName: friend.id === "all" ? "全部猫友" : friend.name,
      visiblePosts,
    });
  },

  toggleLike(event) {
    const id = event.currentTarget.dataset.id;
    const posts = this.data.posts.map((post) => {
      if (post.id !== id) return post;
      const liked = !post.liked;
      return {
        ...post,
        liked,
        likes: Math.max(0, post.likes + (liked ? 1 : -1)),
      };
    });

    this.setData({ posts }, () => {
      this.refreshVisiblePosts(this.data.selectedFriendId);
    });
  },

  previewPostImage(event) {
    this.setData({
      previewVisible: true,
      previewImage: event.currentTarget.dataset.src,
    });
  },

  closeImagePreview() {
    this.setData({
      previewVisible: false,
      previewImage: "",
    });
  },

  noop() {},

  tapComment(event) {
    const id = event.currentTarget.dataset.id;
    const post = this.data.posts.find((item) => item.id === id);
    if (!post) return;

    this.setData({
      commentPanelVisible: true,
      activePostId: id,
      activePostName: post.name,
      commentDraft: "",
    });
  },

  onCommentInput(event) {
    this.setData({ commentDraft: event.detail.value });
  },

  closeCommentPanel() {
    this.setData({
      commentPanelVisible: false,
      activePostId: "",
      activePostName: "",
      commentDraft: "",
    });
  },

  submitComment() {
    const content = this.data.commentDraft.trim();
    if (!content) {
      wx.showToast({
        title: "先写一句评论吧",
        icon: "none",
        duration: 1000,
      });
      return;
    }

    const posts = this.data.posts.map((post) => {
      if (post.id !== this.data.activePostId) return post;
      const newComment = {
        id: `mine-${Date.now()}`,
        author: "我",
        text: content,
        mine: true,
      };
      return {
        ...post,
        comments: post.comments + 1,
        commentList: [...post.commentList, newComment],
      };
    });

    this.setData({ posts }, () => {
      this.saveMyComments();
      this.refreshVisiblePosts(this.data.selectedFriendId);
      this.closeCommentPanel();
    });
  },

  deleteMyComment(event) {
    const { postId, commentId } = event.currentTarget.dataset;
    const posts = this.data.posts.map((post) => {
      if (post.id !== postId) return post;
      const target = post.commentList.find((comment) => comment.id === commentId);
      if (!target || !target.mine) return post;

      return {
        ...post,
        comments: Math.max(0, post.comments - 1),
        commentList: post.commentList.filter((comment) => comment.id !== commentId),
      };
    });

    this.setData({ posts }, () => {
      this.saveMyComments();
      this.refreshVisiblePosts(this.data.selectedFriendId);
    });
  },

  restoreMyComments() {
    const savedComments = wx.getStorageSync(SOCIAL_COMMENTS_STORAGE_KEY) || {};
    const posts = this.data.posts.map((post) => {
      const mineComments = savedComments[post.id] || [];
      return {
        ...post,
        comments: post.comments + mineComments.length,
        commentList: [...post.commentList, ...mineComments],
      };
    });

    this.setData({ posts }, () => {
      this.refreshVisiblePosts("all");
    });
  },

  saveMyComments() {
    const savedComments = this.data.posts.reduce((result, post) => {
      const mineComments = post.commentList.filter((comment) => comment.mine);
      if (mineComments.length) {
        result[post.id] = mineComments;
      }
      return result;
    }, {});

    wx.setStorageSync(SOCIAL_COMMENTS_STORAGE_KEY, savedComments);
  },
});
