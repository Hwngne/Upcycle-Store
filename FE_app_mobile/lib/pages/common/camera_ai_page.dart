import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../../services/ai_service.dart';

class CameraAIPage extends StatefulWidget {
  const CameraAIPage({super.key});

  @override
  State<CameraAIPage> createState() => _CameraAIPageState();
}

class _CameraAIPageState extends State<CameraAIPage>
    with SingleTickerProviderStateMixin {
  XFile? _imageFile;
  bool _isProcessing = false;
  Map<String, dynamic>? _resultData;

  late AnimationController _scanController;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _scanController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _scanController.dispose();
    super.dispose();
  }

  Future<void> _takePicture(ImageSource source) async {
    try {
      final XFile? pickedFile = await _picker.pickImage(source: source);
      if (pickedFile != null) {
        setState(() {
          _imageFile = pickedFile;
          _resultData = null;
        });
        _analyzeWaste();
      }
    } catch (e) {
      print("Lỗi mở camera: $e");
    }
  }

  Future<void> _analyzeWaste() async {
    setState(() => _isProcessing = true);
    final result = await AiService.scanWaste(_imageFile!);

    if (mounted) {
      setState(() {
        _isProcessing = false;
        if (result != null) {
          _resultData = result;
        } else {
          _resultData = {
            "itemName": "Không nhận diện được",
            "category": "Chưa rõ",
            "confidence": 0.0,
            "suggestion":
                "Vui lòng chụp lại ở nơi đủ sáng hoặc thử một góc chụp khác rõ nét hơn.",
            "points": 0,
          };
        }
      });

      _showResultSheet();
    }
  }

  void _resetScanner() {
    setState(() {
      _imageFile = null;
      _resultData = null;
    });
  }

  void _showResultSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: false,
      isDismissible: false,
      builder: (context) => _buildResultPanel(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          // 1. LỚP NỀN
          Positioned.fill(
            child: _imageFile != null
                ? (kIsWeb
                      ? Image.network(_imageFile!.path, fit: BoxFit.cover)
                      : Image.file(File(_imageFile!.path), fit: BoxFit.cover))
                : Container(
                    color: const Color(0xFF1E1E1E),
                    child: const Center(
                      child: Text(
                        "Giao diện Camera thực tế\nsẽ được hiển thị ở đây",
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white38),
                      ),
                    ),
                  ),
          ),

          // 2. KHUNG QUÉT
          if (_imageFile == null && !_isProcessing)
            Positioned.fill(child: _buildScannerOverlay()),

          // 3. APP BAR OVERLAY
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            left: 10,
            right: 10,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white, size: 30),
                  onPressed: () => Navigator.pop(context),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 15,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    children: [
                      Icon(
                        Icons.auto_awesome,
                        color: Colors.greenAccent,
                        size: 18,
                      ),
                      SizedBox(width: 8),
                      Text(
                        "Eco AI",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(
                    Icons.flash_off,
                    color: Colors.white,
                    size: 28,
                  ),
                  onPressed: () {},
                ),
              ],
            ),
          ),

          // 4. MÀN HÌNH ĐANG XỬ LÝ
          if (_isProcessing)
            Container(
              color: Colors.black.withOpacity(0.7),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        const SizedBox(
                          width: 80,
                          height: 80,
                          child: CircularProgressIndicator(
                            color: Colors.greenAccent,
                            strokeWidth: 3,
                          ),
                        ),
                        Icon(
                          Icons.recycling,
                          color: Colors.greenAccent.withOpacity(0.8),
                          size: 40,
                        ),
                      ],
                    ),
                    const SizedBox(height: 25),
                    const Text(
                      "AI đang phân tích rác thải...",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // 5. NÚT CHỤP ẢNH BÊN DƯỚI
          if (_imageFile == null && !_isProcessing)
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.photo_library,
                      color: Colors.white,
                      size: 32,
                    ),
                    onPressed: () => _takePicture(ImageSource.gallery),
                  ),
                  GestureDetector(
                    onTap: () => _takePicture(ImageSource.camera),
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.greenAccent, width: 4),
                        color: Colors.greenAccent.withOpacity(0.2),
                      ),
                      child: Center(
                        child: Container(
                          width: 65,
                          height: 65,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.help_outline,
                      color: Colors.white,
                      size: 32,
                    ),
                    onPressed: () {},
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  // --- KHUNG QUÉT TIA LASER HIỆN ĐẠI ---
  Widget _buildScannerOverlay() {
    const double scanBoxSize = 280.0;
    const double laserHeight = 4.0;

    return Center(
      child: SizedBox(
        width: scanBoxSize,
        height: scanBoxSize,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            // Các góc vuông
            Stack(
              children: [
                _buildCorner(Alignment.topLeft),
                _buildCorner(Alignment.topRight),
                _buildCorner(Alignment.bottomLeft),
                _buildCorner(Alignment.bottomRight),
              ],
            ),

            // Tia laser
            AnimatedBuilder(
              animation: _scanController,
              builder: (context, child) {
                return Positioned(
                  top: _scanController.value * (scanBoxSize - laserHeight),
                  left: 0,
                  right: 0,
                  child: Container(
                    height: laserHeight,
                    decoration: BoxDecoration(
                      color: Colors.greenAccent,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.greenAccent.withOpacity(0.8),
                          blurRadius: 10,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),

            // Dòng chữ hướng dẫn
            Positioned(
              bottom: -50,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    "Đưa vật thể vào trong khung hình",
                    style: TextStyle(color: Colors.white, fontSize: 14),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCorner(Alignment alignment) {
    return Align(
      alignment: alignment,
      child: Container(
        width: 30,
        height: 30,
        decoration: BoxDecoration(
          border: Border(
            top:
                (alignment == Alignment.topLeft ||
                    alignment == Alignment.topRight)
                ? const BorderSide(color: Colors.greenAccent, width: 4)
                : BorderSide.none,
            bottom:
                (alignment == Alignment.bottomLeft ||
                    alignment == Alignment.bottomRight)
                ? const BorderSide(color: Colors.greenAccent, width: 4)
                : BorderSide.none,
            left:
                (alignment == Alignment.topLeft ||
                    alignment == Alignment.bottomLeft)
                ? const BorderSide(color: Colors.greenAccent, width: 4)
                : BorderSide.none,
            right:
                (alignment == Alignment.topRight ||
                    alignment == Alignment.bottomRight)
                ? const BorderSide(color: Colors.greenAccent, width: 4)
                : BorderSide.none,
          ),
        ),
      ),
    );
  }

  Widget _buildResultPanel() {
    return Container(
      padding: const EdgeInsets.all(25),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.eco, color: Colors.green, size: 16),
                    const SizedBox(width: 5),
                    Text(
                      _resultData!['category'],
                      style: const TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  "Chính xác: ${(_resultData!['confidence'] * 100).toInt()}%",
                  style: TextStyle(
                    color: Colors.grey.shade700,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          Text(
            _resultData!['itemName'],
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1A237E),
            ),
          ),
          const SizedBox(height: 15),
          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(15),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.lightbulb_circle,
                  color: Colors.blue,
                  size: 24,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    _resultData!['suggestion'],
                    style: const TextStyle(
                      color: Color(0xFF1565C0),
                      fontSize: 14,
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    _resetScanner();
                  },
                  icon: const Icon(
                    Icons.refresh,
                    color: Colors.black87,
                    size: 18,
                  ),
                  label: const Text(
                    "Chụp lại",
                    style: TextStyle(
                      color: Colors.black87,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                flex: 2,
                child: ElevatedButton.icon(
                  onPressed: () {
                    // 1. Lấy data từ kết quả AI
                    String item = _resultData!['itemName'];
                    String cat = _resultData!['category'];
                    int pts = _resultData!['points'];

                    // 2. GỌI API MAIN BACKEND ĐỂ CỘNG TIỀN
                    // bool success = await EarnService.claimAiPoints(item, cat, pts);

                    // Giả lập thành công cho hiện tại
                    bool success = true;

                    if (success) {
                      Navigator.pop(context);
                      Navigator.pop(context);

                      // Báo thành công
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text("Tuyệt vời! Bạn nhận được +$pts điểm"),
                          backgroundColor: Colors.green,
                        ),
                      );
                    }
                  },
                  icon: const Icon(Icons.stars, color: Colors.white),
                  label: Text(
                    "Nhận +${_resultData!['points']} điểm",
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
