import 'package:flutter/material.dart';
import '../../services/user_service.dart';
import '../../services/earn_service.dart';
import '../common/news_detail_page.dart';
import '../../components/banner_slider.dart';
import '../common/notification_page.dart';
import '../club/create_event_page.dart';
import '../common/earn_points_page.dart';
import '../../services/notification_service.dart';

class ClubHomePage extends StatefulWidget {
  const ClubHomePage({super.key});

  @override
  State<ClubHomePage> createState() => _ClubHomePageState();
}

// 1. Thêm Mixin để giữ trạng thái khi chuyển tab
class _ClubHomePageState extends State<ClubHomePage>
    with AutomaticKeepAliveClientMixin {
  List<dynamic> _homeArticles = [];
  bool _isLoading = true;
  int _unreadNotiCount = 0;

  // Bật cờ giữ trạng thái
  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _initData();
  }

  Future<void> _fetchUserData() async {
    try {
      await UserService.fetchUserInfo();
      if (mounted) {
        setState(() {});
      }
    } catch (e) {
      print("Lỗi cập nhật thông tin: $e");
    }
  }

  Future<void> _initData() async {
    await UserService.fetchUserInfo();
    final res = await EarnService.getArticles();
    await NotificationService.getUnreadCount();

    if (mounted) {
      setState(() {
        List all = res['articles'] ?? [];
        _homeArticles = all
            .where((item) => (item['displayType']) == 'home')
            .toList();
        _isLoading = false;
      });
    }
  }

  void _refreshData() {
    _initData();
  }

  @override
  Widget build(BuildContext context) {
    // 2. Bắt buộc gọi super.build
    super.build(context);

    final size = MediaQuery.of(context).size;
    final double screenHeight = size.height;

    final String displayName = UserData.name ?? "Câu Lạc Bộ";
    final int displayPoints = UserData.points ?? 0;
    final String displayAvatar = UserData.avatar ?? "https://i.pravatar.cc/300";

    return Scaffold(
      backgroundColor: Colors.transparent,
      // 3. Thêm RefreshIndicator để kéo làm mới dữ liệu
      body: RefreshIndicator(
        color: const Color(0xFFB71C1C),
        backgroundColor: Colors.white,
        onRefresh: () async {
          await _initData();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
              // HEADER ĐỎ
              Stack(
                clipBehavior: Clip.none,
                alignment: Alignment.bottomCenter,
                children: [
                  Container(
                    height: screenHeight * 0.32,
                    padding: EdgeInsets.fromLTRB(
                      20,
                      screenHeight * 0.08,
                      20,
                      80,
                    ),
                    decoration: const BoxDecoration(
                      color: Color(0xFFB71C1C),
                      borderRadius: BorderRadius.vertical(
                        bottom: Radius.circular(35),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                            image: DecorationImage(
                              image: NetworkImage(displayAvatar),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                "Chào, $displayName",
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const Text(
                                "Câu Lạc Bộ",
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // NÚT THÔNG BÁO
                        GestureDetector(
                          onTap: () async {
                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (c) => const NotificationPage(),
                              ),
                            );
                            NotificationService.getUnreadCount();
                          },
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              shape: BoxShape.circle,
                            ),
                            child: ValueListenableBuilder<int>(
                              valueListenable:
                                  NotificationService.unreadCountNotifier,
                              builder: (context, count, child) {
                                return Badge(
                                  isLabelVisible: count > 0,
                                  label: Text(
                                    '$count',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                    ),
                                  ),
                                  backgroundColor: Colors.red,
                                  child: const Icon(
                                    Icons.notifications_outlined,
                                    color: Colors.white,
                                    size: 24,
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Positioned(
                    bottom: -30,
                    left: 20,
                    right: 20,
                    child: GestureDetector(
                      onTap: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (c) => const EarnPointsPage(),
                          ),
                        );
                        _refreshData();
                      },
                      child: Container(
                        height: 80,
                        decoration: BoxDecoration(
                          color: const Color(0xFF1A237E),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 15,
                              offset: Offset(0, 10),
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              "Điểm tích lũy",
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                              ),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  "$displayPoints",
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Text(
                                  "💎",
                                  style: TextStyle(fontSize: 18),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: screenHeight * 0.08),

              // NỘI DUNG DƯỚI
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    SizedBox(
                      height: screenHeight * 0.2,
                      child: const BannerSlider(),
                    ),
                    const SizedBox(height: 35),

                    GestureDetector(
                      onTap: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (c) => const CreateEventPage(),
                          ),
                        );
                        _fetchUserData();
                      },
                      child: Container(
                        width: double.infinity,
                        height: 70,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 15,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(
                              Icons.add_circle_outline,
                              color: Color(0xFF1A237E),
                              size: 32,
                            ),
                            SizedBox(width: 10),
                            Text(
                              "Tạo Sự Kiện Mới",
                              style: TextStyle(
                                color: Color(0xFF1A237E),
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 30),

                    // LIST TIN TỨC API
                    if (_isLoading)
                      const Center(child: CircularProgressIndicator())
                    else if (_homeArticles.isNotEmpty)
                      ..._homeArticles.map(
                        (item) => GestureDetector(
                          onTap: () async {
                            String articleId = item['_id'] is Map
                                ? item['_id']['\$oid']
                                : item['_id'].toString();
                            String? quizId;
                            if (item['quiz'] != null) {
                              quizId = item['quiz'] is Map
                                  ? item['quiz']['\$oid']
                                  : item['quiz'].toString();
                            }

                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => NewsDetailPage(
                                  id: articleId,
                                  title: item['title'],
                                  content: item['content'] ?? "",
                                  imageUrl: item['thumbnail'] ?? "",
                                  displayType: "home",
                                  quizId: quizId,
                                ),
                              ),
                            );
                            _refreshData();
                          },
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 15),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(15),
                              boxShadow: const [
                                BoxShadow(color: Colors.black12, blurRadius: 5),
                              ],
                            ),
                            child: Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: Image.network(
                                    item['thumbnail'] ?? "",
                                    width: 80,
                                    height: 80,
                                    fit: BoxFit.cover,
                                    errorBuilder: (c, e, s) => Container(
                                      width: 80,
                                      height: 80,
                                      color: Colors.grey[300],
                                      child: const Icon(
                                        Icons.broken_image,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 15),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item['title'],
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 5),
                                      const Text(
                                        "Tin tức & Sự kiện",
                                        style: TextStyle(
                                          color: Colors.grey,
                                          fontSize: 12,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
