import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../services/user_service.dart';
import '../../services/forum_service.dart';

class BlogPage extends StatefulWidget {
  const BlogPage({super.key});

  @override
  State<BlogPage> createState() => _BlogPageState();
}

class _BlogPageState extends State<BlogPage> {
  List<ForumPost> _myPosts = [];
  bool _isLoading = true;
  String _selectedFilter = "All";

  @override
  void initState() {
    super.initState();
    _loadMyPosts();
  }

  Future<void> _loadMyPosts() async {
    if (_myPosts.isEmpty) setState(() => _isLoading = true);
    try {
      List<ForumPost> allPosts = await ForumService.fetchPosts();
      List<ForumPost> myPosts = allPosts.where((post) {
        return post.authorName == UserData.name || post.authorId == UserData.id;
      }).toList();

      if (mounted) {
        setState(() {
          _myPosts = myPosts;
          _isLoading = false;
        });
      }
    } catch (e) {
      print("Lỗi load blog: $e");
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Logic lọc theo Tab
    final displayPosts = _myPosts.where((post) {
      if (_selectedFilter == "All") return true;
      return (post.tagName ?? "").contains(_selectedFilter) ||
          (post.topic ?? "").contains(_selectedFilter);
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: const Color(0xFFB71C1C),
        centerTitle: true,
        title: Text(
          (UserData.name ?? "THẾ HỆ XANH").toUpperCase(),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            fontSize: 18,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_horiz, color: Colors.white),
            onPressed: () {},
          ),
        ],
        elevation: 0,
      ),

      body: Column(
        children: [
          // 1. HEADER PROFILE
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(bottom: 15),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFFB71C1C), Color(0xFFF8E1E1), Colors.white],
                stops: [0.0, 0.7, 1.0],
              ),
            ),
            child: Column(
              children: [
                const SizedBox(height: 10),
                // Avatar viền trắng
                Container(
                  padding: const EdgeInsets.all(3),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: CircleAvatar(
                    radius: 35,
                    backgroundImage: NetworkImage(
                      UserData.avatar ?? "https://i.pravatar.cc/300",
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                // Tên
                Text(
                  UserData.name ?? "Thế Hệ Xanh",
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2C2C54),
                  ),
                ),
                Text(
                  UserData.role ??
                      "Câu Lạc Bộ", 
                  style: const TextStyle(fontSize: 13, color: Colors.grey),
                ),
                const SizedBox(height: 15),

                // Filter Tabs
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(width: 15),
                      _buildFilterButton(
                        "All",
                        const Color.fromARGB(22, 238, 238, 238),
                        Colors.black87,
                      ), // Nút All
                      const SizedBox(width: 10),
                      _buildFilterButton(
                        "Kiến thức",
                        const Color(0xFFE3F2FD),
                        Colors.blue,
                      ),
                      const SizedBox(width: 10),
                      _buildFilterButton(
                        "Sản phẩm",
                        const Color(0xFFE0F2F1),
                        Colors.teal,
                      ),
                      const SizedBox(width: 10),
                      _buildFilterButton(
                        "Sự kiện",
                        const Color(0xFFFFF3E0),
                        Colors.orange,
                      ),
                      const SizedBox(width: 15),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // 2. DANH SÁCH BÀI VIẾT
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadMyPosts,
              color: const Color(0xFFB71C1C),
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: Color(0xFFB71C1C),
                      ),
                    )
                  : displayPosts.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: const [
                        SizedBox(height: 100),
                        Center(
                          child: Text(
                            "Chưa có bài viết nào",
                            style: TextStyle(color: Colors.grey),
                          ),
                        ),
                      ],
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 10,
                      ),
                      itemCount: displayPosts.length,
                      itemBuilder: (context, index) {
                        return _buildPostItem(displayPosts[index]);
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  // --- WIDGET NÚT LỌC ---
  Widget _buildFilterButton(String label, Color bgColor, Color textColor) {
    bool isSelected = _selectedFilter == label;
    if (label == "All" && isSelected) {
      bgColor = const Color(0xFFB71C1C);
      textColor = Colors.white;
    }

    return GestureDetector(
      onTap: () {
        setState(() => _selectedFilter = label);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? textColor : bgColor,
          borderRadius: BorderRadius.circular(20),
          border: isSelected ? null : Border.all(color: Colors.black12),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected
                ? Colors.white
                : (label == "All" ? Colors.black : textColor),
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  // --- WIDGET BÀI VIẾT ---
  Widget _buildPostItem(ForumPost post) {
    Color tagColor = Colors.blue;
    if ((post.tagName ?? "").contains("Sản phẩm")) tagColor = Colors.teal;
    if ((post.tagName ?? "").contains("Sự kiện")) tagColor = Colors.orange;

    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 20,
                backgroundImage: NetworkImage(post.authorAvatar),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          post.authorName,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          post.time.contains("trước") || post.time == "Vừa xong"
                              ? "• ${post.time}"
                              : "• 29/1",
                          style: TextStyle(
                            color: Colors.grey[500],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    // Tag nằm dưới tên
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: tagColor,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        "CLB | ${post.tagName}",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (post.content.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Text(
                post.content,
                style: const TextStyle(fontSize: 15, color: Colors.black87),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          if (post.image != null && post.image!.isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: CachedNetworkImage(
                imageUrl: post.image!,
                width: double.infinity,
                height: 180,
                fit: BoxFit.cover,
                placeholder: (context, url) =>
                    Container(height: 180, color: Colors.grey[200]),
                errorWidget: (context, url, error) => const SizedBox.shrink(),
              ),
            ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.favorite, color: Colors.red, size: 20),
              const SizedBox(width: 4),
              Text("${post.likes}", style: TextStyle(color: Colors.grey[700])),
              const SizedBox(width: 20),
              Icon(
                Icons.chat_bubble_outline,
                color: Colors.grey[600],
                size: 20,
              ),
              const SizedBox(width: 4),
              Text(
                "${post.comments}",
                style: TextStyle(color: Colors.grey[700]),
              ),
              const Spacer(),
              Icon(Icons.share, color: Colors.grey[400], size: 20),
            ],
          ),
        ],
      ),
    );
  }
}
