import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:video_player/video_player.dart';
import '../../services/auth_service.dart';
import '../../services/earn_service.dart'; // Import service của bạn

class VideoWatchPage extends StatefulWidget {
  final String videoUrl;
  final String title;
  final int bonusPoints;
  final String videoId;

  const VideoWatchPage({
    super.key,
    required this.videoUrl,
    required this.title,
    this.bonusPoints = 15,
    required this.videoId,
  });

  @override
  State<VideoWatchPage> createState() => _VideoWatchPageState();
}

class _VideoWatchPageState extends State<VideoWatchPage> {
  late VideoPlayerController _controller;
  bool _isInitialized = false;
  bool _isCompleted = false;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    // 1. Khởi tạo Video từ URL
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl))
      ..initialize().then((_) {
        setState(() {
          _isInitialized = true;
        });
        if (kIsWeb) {
          _controller.setVolume(0.0);
        } else {
          _controller.setVolume(1.0);
        }
        _controller.play(); // Tự động phát
      });

    // 2. Lắng nghe sự kiện video
    _controller.addListener(_videoListener);
  }

  void _videoListener() {
    // Kiểm tra nếu video đã chạy đến cuối và chưa nhận thưởng
    if (_controller.value.position >= _controller.value.duration &&
        !_isCompleted &&
        _isInitialized) {
      _handleVideoComplete();
    }
  }

  Future<void> _handleVideoComplete() async {
    setState(() {
      _isCompleted = true;
      _isProcessing = true;
    });

    // GỌI API BACKEND MỚI
    bool success = await EarnService.claimVideoPoints(widget.videoId);

    if (!mounted) return;

    if (success) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          title: const Text("Hoàn thành!"),
          content: Text("Bạn đã nhận được thưởng từ video này."),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context, true); // Trả về true để refresh
              },
              child: const Text("OK"),
            ),
          ],
        ),
      );
    } else {
      // Nếu thất bại (VD: đã xem video này rồi)
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "Không thể nhận thưởng (Có thể bạn đã xem video này rồi)",
          ),
        ),
      );
      setState(() => _isProcessing = false);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        title: Text(widget.title, style: const TextStyle(fontSize: 16)),
      ),
      body: Center(
        child: _isInitialized
            ? AspectRatio(
                aspectRatio: _controller.value.aspectRatio,
                child: Stack(
                  alignment: Alignment.bottomCenter,
                  children: [
                    VideoPlayer(_controller),
                    _ControlsOverlay(controller: _controller), // Nút Play/Pause
                    VideoProgressIndicator(_controller, allowScrubbing: true),
                  ],
                ),
              )
            : const CircularProgressIndicator(color: Colors.white),
      ),
    );
  }
}

// Widget phụ hiển thị nút Play/Pause đè lên video
class _ControlsOverlay extends StatelessWidget {
  final VideoPlayerController controller;
  const _ControlsOverlay({required this.controller});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        controller.value.isPlaying ? controller.pause() : controller.play();
      },
      child: Stack(
        children: <Widget>[
          if (!controller.value.isPlaying)
            const Center(
              child: Icon(
                Icons.play_arrow,
                color: Colors.white,
                size: 50.0,
                semanticLabel: 'Play',
              ),
            ),
        ],
      ),
    );
  }
}
