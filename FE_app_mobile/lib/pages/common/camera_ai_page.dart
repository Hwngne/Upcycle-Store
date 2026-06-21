import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:mobile_scanner/mobile_scanner.dart'; 
import '../../services/ai_service.dart';
import '../../services/event_service.dart';
import '../../services/user_service.dart';

class CameraAIPage extends StatefulWidget {
  const CameraAIPage({super.key});

  @override
  State<CameraAIPage> createState() => _CameraAIPageState();
}

class _CameraAIPageState extends State<CameraAIPage>
    with SingleTickerProviderStateMixin {
  // BIẾN KIỂM SOÁT LUỒNG: false = Phân loại rác (Mặc định), true = Điểm danh QR
  bool _isQrMode = false;

  // --- CÁC BIẾN CHO CAMERA LIVE VIEW (LUỒNG RÁC) ---
  CameraController? _cameraController;
  Future<void>? _initializeControllerFuture;
  bool _isCameraReady = false;
  bool _isFlashOn = false;

  // --- CÁC BIẾN CHO QUÉT QR LIVE (LUỒNG QR) ---
  final MobileScannerController _qrController = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
  );

  XFile? _imageFile;
  bool _isProcessing = false;
  bool _isTakingPicture = false;

  // Lưu kết quả xử lý
  Map<String, dynamic>? _wasteResultData; // Data khi quét rác
  Map<String, dynamic>? _qrResultData; // Data khi quét QR

  late AnimationController _scanController;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _initializeCamera();

    _scanController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
  }

  Future<void> _initializeCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        print("Không tìm thấy camera nào trên thiết bị.");
        return;
      }

      _cameraController = CameraController(
        cameras.first,
        ResolutionPreset.medium,
        enableAudio: false,
      );

      _initializeControllerFuture = _cameraController!.initialize();

      await _initializeControllerFuture;
      if (mounted) {
        setState(() {
          _isCameraReady = true;
        });
      }
    } catch (e) {
      print("Lỗi khởi tạo hardware camera: $e");
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    _qrController.dispose(); // Hủy QR Controller
    _scanController.dispose();
    super.dispose();
  }

  // --- HÀM CHỤP ẢNH CHUNG (CHỈ DÙNG CHO PHÂN LOẠI RÁC) ---
  Future<void> _handleTakePicture(ImageSource source) async {
    if (_isTakingPicture || _isProcessing) return;

    XFile? pickedFile;

    try {
      if (source == ImageSource.camera) {
        if (!_isCameraReady || _cameraController == null) return;
        setState(() => _isTakingPicture = true);
        pickedFile = await _cameraController!.takePicture();
      } else {
        setState(() => _isTakingPicture = true);
        pickedFile = await _picker.pickImage(source: ImageSource.gallery);
      }

      if (pickedFile != null) {
        setState(() {
          _imageFile = pickedFile;
          _wasteResultData = null;
        });

        // Lúc này ảnh chỉ dùng cho Rác thải
        _analyzeWaste();
      }
    } catch (e) {
      print("Lỗi khi lấy ảnh: $e");
    } finally {
      if (mounted) {
        setState(() => _isTakingPicture = false);
      }
    }
  }

  // ==========================================
  // LUỒNG 1: XỬ LÝ AI RÁC THẢI 
  // ==========================================
  Future<void> _analyzeWaste() async {
    setState(() => _isProcessing = true);
    try {
      final result = await AiService.scanWaste(_imageFile!);
      if (mounted) {
        setState(() {
          _isProcessing = false;
          if (result != null) {
            _wasteResultData = result;
          } else {
            _wasteResultData = {
              "itemName": "Không nhận diện được",
              "category": "Chưa rõ",
              "confidence": 0.0,
              "suggestion":
                  "Vui lòng chụp lại ở nơi đủ sáng hoặc thử góc khác.",
              "points": 0,
            };
          }
        });
        _showResultSheet();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Lỗi kết nối máy chủ AI. Vui lòng thử lại!"),
            backgroundColor: Colors.orange,
          ),
        );
        _resetScanner();
      }
    }
  }

  // ==========================================
  // LUỒNG 2: XỬ LÝ QUÉT QR LIVE 
  // ==========================================
  Future<void> _processLiveQRCode(String qrText) async {
    if (_isProcessing) return; // Chặn quét liên tục
    setState(() => _isProcessing = true);

    try {
      // Gọi API MỚI truyền chuỗi text thẳng lên server
      final result = await EventService.checkInWithQRText(qrText);

      if (mounted) {
        setState(() {
          _qrResultData = result;
        });
        _showResultSheet();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _qrResultData = {
            "success": false,
            "message": "Lỗi kết nối máy chủ khi xác thực QR.",
          };
        });
        _showResultSheet();
      }
    }
  }

  void _resetScanner() {
    setState(() {
      _imageFile = null;
      _wasteResultData = null;
      _qrResultData = null;
      _isProcessing = false; // Mở khóa máy quét QR
    });
  }

  void _showResultSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: false,
      isDismissible: false,
      builder: (context) =>
          _isQrMode ? _buildQRResultPanel() : _buildWasteResultPanel(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isClubRole = UserData.role?.toLowerCase() == 'club';

    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          // 1. LỚP NỀN CAMERA
          Positioned.fill(
            child: _imageFile != null
                ? (kIsWeb
                      ? Image.network(_imageFile!.path, fit: BoxFit.cover)
                      : Image.file(File(_imageFile!.path), fit: BoxFit.cover))
                : _isQrMode
                // --- MÁY QUÉT QR LIVE ---
                ? MobileScanner(
                    controller: _qrController,
                    onDetect: (capture) {
                      final List<Barcode> barcodes = capture.barcodes;
                      if (barcodes.isNotEmpty && !_isProcessing) {
                        final String? code = barcodes.first.rawValue;
                        if (code != null) {
                          _processLiveQRCode(
                            code,
                          ); // Kích hoạt ngay khi thấy mã
                        }
                      }
                    },
                  )
                // --- CAMERA AI RÁC THẢI ---
                : (_isCameraReady && _cameraController != null)
                ? AspectRatio(
                    aspectRatio: _cameraController!.value.aspectRatio,
                    child: CameraPreview(_cameraController!),
                  )
                : Container(
                    color: const Color(0xFF1E1E1E),
                    child: const Center(
                      child: CircularProgressIndicator(
                        color: Colors.greenAccent,
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
                  child: Row(
                    children: [
                      Icon(
                        _isQrMode ? Icons.qr_code_scanner : Icons.auto_awesome,
                        color: _isQrMode
                            ? Colors.blueAccent
                            : Colors.greenAccent,
                        size: 18,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _isQrMode ? "Điểm danh QR" : "Eco AI",
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: Icon(
                    _isFlashOn ? Icons.flash_on : Icons.flash_off,
                    color: _isFlashOn ? Colors.yellowAccent : Colors.white,
                    size: 28,
                  ),
                  onPressed: () async {
                    if (_isQrMode) {
                      await _qrController.toggleTorch();
                      setState(() => _isFlashOn = !_isFlashOn);
                    } else if (_cameraController != null && _isCameraReady) {
                      FlashMode newMode = _isFlashOn
                          ? FlashMode.off
                          : FlashMode.torch;
                      await _cameraController!.setFlashMode(newMode);
                      setState(() => _isFlashOn = !_isFlashOn);
                    }
                  },
                ),
              ],
            ),
          ),

          // 4. THANH TOGGLE CHUYỂN CHẾ ĐỘ
          if (isClubRole && _imageFile == null && !_isProcessing)
            Positioned(
              top: MediaQuery.of(context).padding.top + 70,
              left: 30,
              right: 30,
              child: Container(
                height: 45,
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(25),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() {
                          _isQrMode = false;
                          _resetScanner();
                        }),
                        child: Container(
                          decoration: BoxDecoration(
                            color: !_isQrMode
                                ? Colors.greenAccent
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(25),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            "Phân loại rác",
                            style: TextStyle(
                              color: !_isQrMode ? Colors.black : Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() {
                          _isQrMode = true;
                          _resetScanner();
                        }),
                        child: Container(
                          decoration: BoxDecoration(
                            color: _isQrMode
                                ? Colors.blueAccent
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(25),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            "Quét vé sự kiện",
                            style: TextStyle(
                              color: _isQrMode ? Colors.white : Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // 5. MÀN HÌNH ĐANG XỬ LÝ LOADING
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
                        SizedBox(
                          width: 80,
                          height: 80,
                          child: CircularProgressIndicator(
                            color: _isQrMode
                                ? Colors.blueAccent
                                : Colors.greenAccent,
                            strokeWidth: 3,
                          ),
                        ),
                        Icon(
                          _isQrMode ? Icons.qr_code : Icons.recycling,
                          color:
                              (_isQrMode
                                      ? Colors.blueAccent
                                      : Colors.greenAccent)
                                  .withOpacity(0.8),
                          size: 40,
                        ),
                      ],
                    ),
                    const SizedBox(height: 25),
                    Text(
                      _isQrMode
                          ? "Đang xác thực vé..."
                          : "AI đang phân tích rác thải...",
                      style: const TextStyle(
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

          // 6. THANH ĐIỀU KHIỂN CHỤP ẢNH (ẨN ĐI KHI Ở CHẾ ĐỘ QR)
          if (_imageFile == null &&
              !_isProcessing &&
              _isCameraReady &&
              !_isQrMode)
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
                    onPressed: () => _handleTakePicture(ImageSource.gallery),
                  ),
                  GestureDetector(
                    onTap: () => _handleTakePicture(ImageSource.camera),
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
                          child: _isTakingPicture
                              ? const CircularProgressIndicator(
                                  color: Colors.green,
                                )
                              : null,
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

  Widget _buildScannerOverlay() {
    const double scanBoxSize = 280.0;
    const double laserHeight = 4.0;
    final Color themeColor = _isQrMode ? Colors.blueAccent : Colors.greenAccent;

    return Center(
      child: SizedBox(
        width: scanBoxSize,
        height: scanBoxSize,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Stack(
              children: [
                _buildCorner(Alignment.topLeft, themeColor),
                _buildCorner(Alignment.topRight, themeColor),
                _buildCorner(Alignment.bottomLeft, themeColor),
                _buildCorner(Alignment.bottomRight, themeColor),
              ],
            ),
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
                      color: themeColor,
                      boxShadow: [
                        BoxShadow(
                          color: themeColor.withOpacity(0.8),
                          blurRadius: 10,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
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
                  child: Text(
                    _isQrMode
                        ? "Đưa mã QR vào khung hình để quét"
                        : "Đưa vật thể vào trong khung hình",
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCorner(Alignment alignment, Color color) {
    BorderSide cornerSide = BorderSide(color: color, width: 4);
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
                ? cornerSide
                : BorderSide.none,
            bottom:
                (alignment == Alignment.bottomLeft ||
                    alignment == Alignment.bottomRight)
                ? cornerSide
                : BorderSide.none,
            left:
                (alignment == Alignment.topLeft ||
                    alignment == Alignment.bottomLeft)
                ? cornerSide
                : BorderSide.none,
            right:
                (alignment == Alignment.topRight ||
                    alignment == Alignment.bottomRight)
                ? cornerSide
                : BorderSide.none,
          ),
        ),
      ),
    );
  }

  Widget _buildWasteResultPanel() {
    if (_wasteResultData == null) return const SizedBox();

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
                      _wasteResultData!['category'] ?? "",
                      style: const TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          Text(
            _wasteResultData!['itemName'] ?? "",
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
                    _wasteResultData!['suggestion'] ?? "",
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
                    Navigator.pop(context);
                    Navigator.pop(context);
                  },
                  icon: const Icon(Icons.stars, color: Colors.white),
                  label: Text(
                    "Nhận +${_wasteResultData!['points'] ?? 0} điểm",
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

  Widget _buildQRResultPanel() {
    if (_qrResultData == null) return const SizedBox();

    final bool isSuccess = _qrResultData!['success'] == true;
    final String message = _qrResultData!['message'] ?? "Không có phản hồi";

    return Container(
      padding: const EdgeInsets.all(25),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isSuccess ? Icons.check_circle : Icons.error,
            color: isSuccess ? Colors.green : Colors.red,
            size: 70,
          ),
          const SizedBox(height: 15),
          Text(
            isSuccess ? "Thành công" : "Thất bại",
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: isSuccess ? Colors.green[800] : Colors.red[800],
            ),
          ),
          const SizedBox(height: 10),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              color: Colors.black87,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 30),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _resetScanner(); // Sẵn sàng quét vé tiếp theo
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: isSuccess ? Colors.green : Colors.red,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                "Tiếp tục quét",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
