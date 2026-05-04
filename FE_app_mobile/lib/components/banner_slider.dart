import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import '../services/event_service.dart';
import '../services/api_constrants.dart';
import 'package:cached_network_image/cached_network_image.dart';

class BannerSlider extends StatefulWidget {
  const BannerSlider({super.key});

  @override
  State<BannerSlider> createState() => _BannerSliderState();
}

class _BannerSliderState extends State<BannerSlider> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  Timer? _timer;
  List<dynamic> _banners = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchBanners();
  }

  // Gọi API lấy ảnh thật
  Future<void> _fetchBanners() async {
    final data = await EventService.getBanners();
    if (mounted) {
      setState(() {
        _banners = data;
        _isLoading = false;

        // ĐÃ SỬA: Cập nhật danh sách lưu cứng thành link Cloudinary
        if (_banners.isEmpty) {
          _banners = [
            {
              'bannerUrl':
                  "https://res.cloudinary.com/dl4vyi8yx/image/upload/v1777876255/banner_1_tsnurp.png",
            },
            {
              'bannerUrl':
                  "https://res.cloudinary.com/dl4vyi8yx/image/upload/v1777876261/banner_2_olimi8.png",
            },
            {
              'bannerUrl':
                  "https://res.cloudinary.com/dl4vyi8yx/image/upload/v1777876263/banner_3_jvxztq.png",
            },
          ];
        }
      });
      _startAutoScroll();
    }
  }

  void _startAutoScroll() {
    _timer = Timer.periodic(const Duration(seconds: 4), (Timer timer) {
      if (_banners.isEmpty) return;
      if (_currentPage < _banners.length - 1) {
        _currentPage++;
      } else {
        _currentPage = 0;
      }

      if (_pageController.hasClients) {
        _pageController.animateToPage(
          _currentPage,
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  // Hàm xử lý link ảnh mạng
  String _getImageUrl(String url) {
    if (url.startsWith('http')) return url;
    String serverUrl = ApiConstants.serverUrl;
    return "$serverUrl/$url".replaceAll(RegExp(r'(?<!:)/{2,}'), '/');
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFFB71C1C)),
      );
    }

    return Stack(
      alignment: Alignment.bottomCenter,
      children: [
        PageView.builder(
          controller: _pageController,
          itemCount: _banners.length,
          onPageChanged: (int page) {
            setState(() {
              _currentPage = page;
            });
          },
          itemBuilder: (context, index) {
            final banner = _banners[index];
            final rawUrl = banner['bannerUrl'] ?? "";

            // Phân biệt ảnh local (app) hay ảnh mạng (API)
            final bool isLocalAsset = rawUrl.startsWith('assets/');
            final String finalImgUrl = isLocalAsset
                ? rawUrl
                : _getImageUrl(rawUrl);

            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 5),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              // Dùng ClipRRect để cắt bo góc cho toàn bộ các lớp bên trong
              child: ClipRRect(
                borderRadius: BorderRadius.circular(15),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // LỚP 1: Lớp ảnh nền mờ (Phóng to tràn viền)
                    Image(
                      image: isLocalAsset
                          ? AssetImage(finalImgUrl) as ImageProvider
                          // Thay NetworkImage bằng CachedNetworkImageProvider
                          : CachedNetworkImageProvider(finalImgUrl),
                      fit: BoxFit.cover,
                    ),

                    // LỚP 2: Hiệu ứng làm mờ và làm tối nhẹ nền
                    BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 15.0, sigmaY: 15.0),
                      child: Container(
                        color: Colors.black.withOpacity(
                          0.3,
                        ), // Tối nhẹ để làm nổi bật ảnh chính
                      ),
                    ),

                    // LỚP 3: Ảnh chính của sự kiện (Hiển thị trọn vẹn)
                    Image(
                      image: isLocalAsset
                          ? AssetImage(finalImgUrl) as ImageProvider
                          // Thay NetworkImage bằng CachedNetworkImageProvider
                          : CachedNetworkImageProvider(finalImgUrl),
                      fit: BoxFit.contain, // Không bao giờ bị cắt mất ảnh
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        // Indicator
        Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_banners.length, (index) {
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                height: 6,
                width: _currentPage == index ? 20 : 6,
                decoration: BoxDecoration(
                  color: _currentPage == index
                      ? Colors.white
                      : Colors.white.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(3),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}
