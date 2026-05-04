import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart'; 
import '../../services/waste_service.dart';

class WasteLookupPage extends StatefulWidget {
  const WasteLookupPage({super.key});

  @override
  State<WasteLookupPage> createState() => _WasteLookupPageState();
}

class _WasteLookupPageState extends State<WasteLookupPage> {
  // Biến lưu lựa chọn của người dùng
  String? _selectedType;
  String? _selectedArea;

  // Dữ liệu
  List<dynamic> _allStations = []; // Dữ liệu gốc từ API
  List<dynamic> _foundStations = []; // Dữ liệu đang hiển thị (đã lọc)

  // Danh sách cho Dropdown (Tự động lấy từ data)
  List<String> _wasteTypes = [];
  List<String> _areas = [];

  bool _isLoading = true; // Trạng thái tải
  bool _hasSearched = false; // Trạng thái kiểm tra đã bấm nút tìm kiếm chưa

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  // --- HÀM TẢI DỮ LIỆU TỪ SERVER ---
  Future<void> _loadData() async {
    final data = await WasteService.fetchStations();

    // Trích xuất danh sách Loại rác và Khu vực duy nhất để đưa vào Dropdown
    final Set<String> typesSet = {};
    final Set<String> areasSet = {};

    for (var item in data) {
      if (item['type'] != null) typesSet.add(item['type']);
      if (item['area'] != null) areasSet.add(item['area']);
    }

    if (mounted) {
      setState(() {
        _allStations = data;
        _foundStations = data; // Ban đầu hiển thị hết
        _wasteTypes = typesSet.toList()..sort();
        _areas = areasSet.toList()..sort();
        _isLoading = false; // Tắt loading
      });
    }
  }

  // Hàm lọc dữ liệu khi bấm nút Tìm
  void _runFilter() {
    setState(() {
      _hasSearched = true; // Đánh dấu là đã thực hiện tìm kiếm
      _foundStations = _allStations.where((station) {
        // Nếu chưa chọn gì (null) thì coi như đúng
        bool matchType =
            _selectedType == null || station['type'] == _selectedType;
        bool matchArea =
            _selectedArea == null || station['area'] == _selectedArea;
        return matchType && matchArea;
      }).toList();
    });
  }

  // --- HÀM MỞ GOOGLE MAPS ---
  Future<void> _openGoogleMaps(String address) async {
    if (address.trim().isEmpty) return;

    // Mã hóa địa chỉ để đưa vào link an toàn
    final String query = Uri.encodeComponent(address);
    final Uri googleUrl = Uri.parse(
      "https://www.google.com/maps/search/?api=1&query=$query",
    );

    try {
      // mode: LaunchMode.externalApplication giúp mở hẳn app Google Maps nếu có cài đặt
      if (!await launchUrl(googleUrl, mode: LaunchMode.externalApplication)) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(const SnackBar(content: Text('Không thể mở bản đồ!')));
        }
      }
    } catch (e) {
      print("Lỗi khi mở map: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5), 
      appBar: AppBar(
        backgroundColor: const Color(0xFFB71C1C),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Tra cứu Trạm thu gom",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFB71C1C)),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // --- KHUNG TÌM KIẾM  ---
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: const [
                        BoxShadow(color: Colors.black12, blurRadius: 10),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Bộ lọc tìm kiếm",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1A237E),
                          ),
                        ),
                        const SizedBox(height: 15),

                        // 1. Dropdown Loại rác
                        _buildDropdownLabel("Loại rác tiếp nhận"),
                        DropdownButtonFormField<String>(
                          value: _selectedType,
                          isExpanded: true,
                          hint: const Text("Chọn loại rác..."),
                          decoration: _inputDecoration(),
                          items: _wasteTypes.map((String type) {
                            return DropdownMenuItem<String>(
                              value: type,
                              child: Text(
                                type,
                                style: const TextStyle(fontSize: 13),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged: (val) =>
                              setState(() => _selectedType = val),
                        ),

                        const SizedBox(height: 15),

                        // 2. Dropdown Khu vực
                        _buildDropdownLabel("Khu vực"),
                        DropdownButtonFormField<String>(
                          value: _selectedArea,
                          hint: const Text("Chọn khu vực..."),
                          decoration: _inputDecoration(),
                          items: _areas.map((String area) {
                            return DropdownMenuItem<String>(
                              value: area,
                              child: Text(
                                area,
                                style: const TextStyle(fontSize: 14),
                              ),
                            );
                          }).toList(),
                          onChanged: (val) =>
                              setState(() => _selectedArea = val),
                        ),

                        const SizedBox(height: 25),

                        // Nút Tìm kiếm & Nút Xóa lọc
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () {
                                  setState(() {
                                    _selectedType = null;
                                    _selectedArea = null;
                                    _foundStations = _allStations; // Reset list
                                    _hasSearched =
                                        false; // Reset trạng thái tìm kiếm
                                  });
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.grey[200],
                                  foregroundColor: Colors.black,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 15,
                                  ),
                                ),
                                child: const Text("Xóa lọc"),
                              ),
                            ),
                            const SizedBox(width: 15),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: _runFilter,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(
                                    0xFF1A237E,
                                  ), // Xanh đậm
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 15,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                child: const Text(
                                  "Tìm kiếm",
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 25),

                  // --- KẾT QUẢ TÌM KIẾM ---
                  Text(
                    _hasSearched
                        ? "Kết quả tìm thấy (${_foundStations.length})"
                        : "Đề xuất cho bạn (${_foundStations.length})",
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Danh sách hiển thị
                  _foundStations.isEmpty
                      ? const Padding(
                          padding: EdgeInsets.only(top: 30),
                          child: Center(
                            child: Text(
                              "Không tìm thấy trạm nào!",
                              style: TextStyle(color: Colors.grey),
                            ),
                          ),
                        )
                      : ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _foundStations.length,
                          itemBuilder: (context, index) {
                            final station = _foundStations[index];

                            // Tạo chuỗi địa chỉ để tìm trên map (ưu tiên địa chỉ chi tiết + khu vực)
                            final String addressForMap =
                                "${station['address'] ?? ''}, ${station['area'] ?? ''}";

                            return InkWell(
                              onTap: () => _openGoogleMaps(
                                addressForMap,
                              ), // Mở Map khi nhấn vào
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 15),
                                padding: const EdgeInsets.all(15),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border(
                                    left: BorderSide(
                                      color: _getStationColor(
                                        station['type'] ?? "",
                                      ),
                                      width: 5,
                                    ),
                                  ),
                                  boxShadow: const [
                                    BoxShadow(
                                      color: Colors.black12,
                                      blurRadius: 5,
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            station['name'] ?? "Trạm thu gom",
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 16,
                                            ),
                                          ),
                                        ),
                                        // Thêm icon chỉ đường nhỏ để gợi ý người dùng có thể bấm vào
                                        const Icon(
                                          Icons.directions,
                                          color: Color(0xFF1A237E),
                                          size: 20,
                                        ),
                                      ],
                                    ),
                                    const Divider(height: 20),
                                    _rowInfo(
                                      Icons.delete_outline,
                                      station['type'] ?? "Không xác định",
                                    ),
                                    const SizedBox(height: 5),
                                    _rowInfo(
                                      Icons.location_on_outlined,
                                      "${station['area'] ?? ''} - ${station['address'] ?? ''}",
                                    ),
                                    const SizedBox(height: 5),
                                    _rowInfo(
                                      Icons.phone,
                                      station['contact'] ?? "Không có SĐT",
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),

                  const SizedBox(height: 50),
                ],
              ),
            ),
    );
  }

  // --- Các Widget phụ trợ ---

  Widget _buildDropdownLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
    );
  }

  InputDecoration _inputDecoration() {
    return InputDecoration(
      contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Colors.grey),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
    );
  }

  Widget _rowInfo(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: Colors.grey),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 13, color: Colors.black87),
          ),
        ),
      ],
    );
  }

  // Đổi màu viền trái theo loại rác
  Color _getStationColor(String type) {
    String t = type.toLowerCase();
    if (t.contains("nhựa") || t.contains("plastic")) return Colors.blue;
    if (t.contains("giấy") || t.contains("paper")) return Colors.orange;
    if (t.contains("thực phẩm") || t.contains("food")) return Colors.green;
    return Colors.red; 
  }
}
