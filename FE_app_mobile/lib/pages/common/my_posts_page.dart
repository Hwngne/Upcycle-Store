import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../components/app_background.dart';
import '../../services/user_service.dart';
import '../../services/forum_service.dart';

class MyPostsPage extends StatefulWidget {
  const MyPostsPage({super.key});

  @override
  State<MyPostsPage> createState() => _MyPostsPageState();
}

class _MyPostsPageState extends State<MyPostsPage> {
  // Biến quản lý bộ lọc
  String _selectedCategory = "All";

  // Biến lưu ngày đã chọn
  DateTime? _fromDate;
  DateTime? _toDate;

  final TextEditingController _fromDateController = TextEditingController();
  final TextEditingController _toDateController = TextEditingController();

  // Dữ liệu
  List<ForumPost> _allPosts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fromDate = DateTime(2026, 1, 1);
    _toDate = DateTime.now();
    _fromDateController.text = "1/1/2026";
    _toDateController.text =
        "${_toDate!.day}/${_toDate!.month}/${_toDate!.year}";

    _fetchMyPosts();
  }

  // Hàm lấy dữ liệu (Dùng cho cả init và Refresh)
  Future<void> _fetchMyPosts() async {
    if (mounted) setState(() => _isLoading = true);

    List<ForumPost> posts = await ForumService.fetchPosts();

    if (mounted) {
      setState(() {
        _allPosts = posts;
        _isLoading = false;
      });
    }
  }

  Future<void> _handleDeletePost(String postId) async {
    bool? confirm = await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Xác nhận xóa"),
        content: const Text("Bạn có chắc chắn muốn xóa bài viết này không?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text("Hủy"),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text("Xóa", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      bool success = await ForumService.deletePost(postId);
      if (success) {
        setState(() {
          _allPosts.removeWhere((p) => p.id == postId);
        });
        if (mounted)
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(const SnackBar(content: Text("Đã xóa bài viết")));
      } else {
        if (mounted)
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(const SnackBar(content: Text("Lỗi khi xóa bài viết")));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // LOGIC LỌC DỮ LIỆU
    final myPosts = _allPosts.where((post) {
      // 1. Check tác giả
      final bool isAuthor =
          post.authorId == UserData.id || post.authorName == UserData.name;

      // 2. Check Loại bài (Logic mở rộng)
      bool matchesCategory = false;
      if (_selectedCategory == "All") {
        matchesCategory = true;
      } else {
        String topic = (post.topic ?? "").toLowerCase();
        String category = (post.category ?? "").toLowerCase();
        String tag = (post.tagName).toLowerCase();
        String filterKey = _selectedCategory.toLowerCase();

        if (filterKey == "kiến thức") {
          matchesCategory =
              topic.contains("kiến thức") ||
              category.contains("kiến thức") ||
              tag.contains("kiến thức");
        } else if (filterKey == "sản phẩm") {
          matchesCategory =
              topic.contains("sản phẩm") ||
              category.contains("sản phẩm") ||
              tag.contains("sản phẩm");
        }
      }

      // 3. Check Ngày
      bool matchesDate = true;
      if (post.timestamp != null) {
        if (_fromDate != null) {
          matchesDate =
              matchesDate &&
              !post.timestamp!.isBefore(
                _fromDate!.copyWith(hour: 0, minute: 0, second: 0),
              );
        }
        if (_toDate != null) {
          matchesDate =
              matchesDate &&
              !post.timestamp!.isAfter(
                _toDate!.copyWith(hour: 23, minute: 59, second: 59),
              );
        }
      }

      return isAuthor && matchesCategory && matchesDate;
    }).toList();

    return Scaffold(
      body: AppBackground(
        child: Column(
          children: [
            // HEADER
            Container(
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 10,
                bottom: 20,
                left: 10,
                right: 20,
              ),
              color: const Color(0xFFB71C1C),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Expanded(
                    child: Center(
                      child: Text(
                        "Bài đăng của tôi",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 40),
                ],
              ),
            ),

            Expanded(
              //  PULL TO REFRESH
              child: RefreshIndicator(
                onRefresh: _fetchMyPosts,
                color: const Color(0xFFB71C1C),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: 25,
                          horizontal: 30,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF2C2C54),
                          borderRadius: BorderRadius.circular(15),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 10,
                              offset: Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: const [
                                Icon(
                                  Icons.local_library,
                                  color: Colors.white,
                                  size: 28,
                                ),
                                SizedBox(width: 15),
                                Text(
                                  "Bài đăng",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                  ),
                                ),
                              ],
                            ),
                            _isLoading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : Text(
                                    "${myPosts.length}",
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 28,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 25),

                      // BỘ CHỌN NGÀY
                      _buildDateFilterRow("Từ ngày", _fromDateController, true),
                      const SizedBox(height: 15),
                      _buildDateFilterRow("Đến ngày", _toDateController, false),

                      const SizedBox(height: 20),
                      Row(
                        children: [
                          const Text(
                            "Loại bài đăng",
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                          const SizedBox(width: 15),
                          _buildFilterButton("Kiến thức", Colors.lightBlue),
                          const SizedBox(width: 10),
                          _buildFilterButton("Sản phẩm", Colors.teal),
                        ],
                      ),

                      const SizedBox(height: 15),

                      // NÚT HIỂN THỊ TẤT CẢ
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedCategory = "All";
                          });
                        },
                        child: Row(
                          children: [
                            Icon(
                              _selectedCategory == "All"
                                  ? Icons.radio_button_checked
                                  : Icons.radio_button_unchecked,
                              size: 24,
                              color: _selectedCategory == "All"
                                  ? const Color(0xFFB71C1C)
                                  : Colors.grey,
                            ),
                            const SizedBox(width: 10),
                            Text(
                              "Hiển thị tất cả bài viết",
                              style: TextStyle(
                                fontWeight: FontWeight.w500,
                                color: _selectedCategory == "All"
                                    ? Colors.black
                                    : Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 20),
                      const Divider(thickness: 1, color: Colors.black12),
                      const SizedBox(height: 10),

                      // LIST BÀI VIẾT
                      _isLoading
                          ? const Center(
                              child: CircularProgressIndicator(
                                color: Color(0xFFB71C1C),
                              ),
                            )
                          : myPosts.isEmpty
                          ? const Center(
                              child: Padding(
                                padding: EdgeInsets.only(top: 50),
                                child: Text(
                                  "Không tìm thấy bài đăng nào.",
                                  style: TextStyle(color: Colors.grey),
                                ),
                              ),
                            )
                          : ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: myPosts.length,
                              itemBuilder: (context, index) =>
                                  _buildPostItem(myPosts[index]),
                            ),
                      const SizedBox(height: 50),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // UI Components
  Widget _buildDateFilterRow(
    String label,
    TextEditingController controller,
    bool isFromDate,
  ) {
    return Row(
      children: [
        SizedBox(
          width: 80,
          child: Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
        ),
        Expanded(
          child: GestureDetector(
            onTap: () => _selectDate(context, controller, isFromDate),
            child: Container(
              height: 45,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.black12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    controller.text.isEmpty ? "Chọn ngày" : controller.text,
                    style: const TextStyle(color: Colors.black, fontSize: 14),
                  ),
                  const Icon(
                    Icons.calendar_today,
                    size: 18,
                    color: Colors.grey,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _selectDate(
    BuildContext context,
    TextEditingController controller,
    bool isFromDate,
  ) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isFromDate
          ? (_fromDate ?? DateTime.now())
          : (_toDate ?? DateTime.now()),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFFB71C1C),
              onPrimary: Colors.white,
              onSurface: Colors.black,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        if (isFromDate)
          _fromDate = picked;
        else
          _toDate = picked;
        controller.text = "${picked.day}/${picked.month}/${picked.year}";
      });
    }
  }

  Widget _buildFilterButton(String label, Color color) {
    bool isSelected = _selectedCategory == label;
    return InkWell(
      onTap: () =>
          setState(() => _selectedCategory = isSelected ? "All" : label),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? color : Colors.grey[200],
          borderRadius: BorderRadius.circular(20),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: color.withOpacity(0.4),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [],
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black54,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ),
    );
  }

  Widget _buildPostItem(ForumPost item) {
    Color tagColor = item.topic == "Kiến thức" ? Colors.lightBlue : Colors.teal;
    if (item.topic == "Sản phẩm") tagColor = Colors.teal;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundImage: NetworkImage(item.authorAvatar),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.authorName,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: tagColor,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      item.topic ?? "Chung",
                      style: const TextStyle(color: Colors.white, fontSize: 10),
                    ),
                  ),
                ],
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(
                  Icons.delete_outline,
                  color: Colors.red,
                  size: 20,
                ),
                onPressed: () => _handleDeletePost(item.id),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            item.time,
            style: const TextStyle(color: Colors.grey, fontSize: 12),
          ),
          const SizedBox(height: 5),

          Text(item.content, style: const TextStyle(fontSize: 14)),
          const SizedBox(height: 10),

          //  CACHED IMAGE
          if (item.image != null && item.image!.isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.circular(15),
              child: CachedNetworkImage(
                imageUrl: item.image!,
                width: double.infinity,
                height: 180,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  height: 180,
                  color: Colors.grey[200],
                  child: const Center(
                    child: CircularProgressIndicator(color: Colors.grey),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  height: 180,
                  color: Colors.grey[200],
                  child: const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.broken_image, color: Colors.grey),
                      SizedBox(height: 5),
                      Text(
                        "Lỗi tải ảnh",
                        style: TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.favorite_border, size: 20, color: Colors.grey),
              const SizedBox(width: 5),
              Text("${item.likes}", style: const TextStyle(color: Colors.grey)),
              const SizedBox(width: 20),
              const Icon(
                Icons.chat_bubble_outline,
                size: 20,
                color: Colors.grey,
              ),
              const SizedBox(width: 5),
              Text(
                "${item.comments}",
                style: const TextStyle(color: Colors.grey),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
