import 'package:flutter/material.dart';
import '../../components/app_background.dart';
import '../../services/gift_service.dart'; // Import Service

// --- 1. ĐỊNH NGHĨA MODEL NỘI BỘ (Để không phụ thuộc mock_data) ---
enum TransactionStatus { pending, completed, cancelled, expired }

class TransactionItem {
  final String id;
  final String itemName;
  final String statusText; // Text hiển thị
  final TransactionStatus status;
  final String role; // "Đổi quà"
  final String price;
  final DateTime date;
  final DateTime expiresAt;

  TransactionItem({
    required this.id,
    required this.itemName,
    required this.statusText,
    required this.status,
    required this.role,
    required this.price,
    required this.date,
    required this.expiresAt,
  });
}

class TransactionHistoryPage extends StatefulWidget {
  const TransactionHistoryPage({super.key});

  @override
  State<TransactionHistoryPage> createState() => _TransactionHistoryPageState();
}

class _TransactionHistoryPageState extends State<TransactionHistoryPage> {
  // Service
  final GiftService _giftService = GiftService();

  // Dữ liệu
  List<TransactionItem> _transactionList = [];
  bool _isLoading = true;

  // Biến bộ lọc
  String _selectedRole = "All"; // All, Bên mua, Bên bán, Đổi quà
  DateTime? _fromDate;
  DateTime? _toDate;

  final TextEditingController _fromDateController = TextEditingController();
  final TextEditingController _toDateController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Mặc định lọc từ đầu năm 2024
    _fromDate = DateTime(2024, 1, 1);
    _toDate = DateTime.now();

    _fromDateController.text = "1/1/2024";
    _toDateController.text =
        "${_toDate!.day}/${_toDate!.month}/${_toDate!.year}";

    // GỌI API LẤY DỮ LIỆU THẬT
    _loadHistoryData();
  }

  // --- HÀM TẢI DỮ LIỆU TỪ SERVER (ĐÃ SỬA LỖI AN TOÀN) ---
  Future<void> _loadHistoryData() async {
    try {
      final rawData = await _giftService.fetchHistory();

      List<TransactionItem> mappedList = [];

      for (var item in rawData) {
        // 1. Xử lý trạng thái từ Server (pending/used/expired)
        String serverStatus = item['status'] ?? 'pending';
        TransactionStatus statusEnum = TransactionStatus.pending;
        String statusDisplay = "Chờ nhận quà";

        if (serverStatus == 'used' || serverStatus == 'completed') {
          statusEnum = TransactionStatus.completed;
          statusDisplay = "Đã nhận quà";
        } else if (serverStatus == 'expired') {
          statusEnum = TransactionStatus.expired;
          statusDisplay = "Đã hết hạn";
        } else if (serverStatus == 'cancelled') {
          statusEnum = TransactionStatus.cancelled;
          statusDisplay = "Đã hủy";
        } else {
          // pending
          statusEnum = TransactionStatus.pending;
          statusDisplay = "Chờ nhận quà";
        }

        // 2. Xử lý Ngày tháng AN TOÀN (Tránh crash nếu null)
        DateTime createdDate = DateTime.now();
        if (item['createdAt'] != null) {
          createdDate =
              DateTime.tryParse(item['createdAt'].toString()) ?? DateTime.now();
        }

        DateTime expiresDate = createdDate.add(const Duration(days: 3));
        if (item['expiresAt'] != null) {
          expiresDate =
              DateTime.tryParse(item['expiresAt'].toString()) ?? expiresDate;
        }

        // 3. Xử lý Mã Code (Hỗ trợ cả tên cũ và mới)
        String transCode =
            item['redemptionCode'] ?? item['rewardCode'] ?? 'N/A';

        // 4. Map sang Object
        mappedList.add(
          TransactionItem(
            id: transCode,
            itemName: item['giftName'] ?? 'Quà tặng',
            status: statusEnum,
            statusText: statusDisplay,
            role: "Đổi quà", // API này chuyên về đổi quà
            price: "-${item['pointsSpent'] ?? 0} Điểm", // Fix lỗi hiển thị null
            date: createdDate,
            expiresAt: expiresDate,
          ),
        );
      }

      if (mounted) {
        setState(() {
          _transactionList = mappedList;
          _isLoading = false;
        });
      }
    } catch (e) {
      print("❌ Lỗi load lịch sử: $e");
      if (mounted) {
        setState(() {
          _isLoading = false; // Tắt loading dù lỗi để không treo màn hình
        });
      }
    }
  }

  // Hàm chọn ngày (Giữ nguyên)
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
        if (isFromDate) {
          _fromDate = picked;
        } else {
          _toDate = picked;
        }
        controller.text = "${picked.day}/${picked.month}/${picked.year}";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // LOGIC LỌC DỮ LIỆU
    final filteredList = _transactionList.where((item) {
      // 1. Lọc theo Vai trò
      bool matchRole = _selectedRole == "All" || item.role == _selectedRole;

      // 2. Lọc theo Ngày
      bool matchDate = true;
      if (_fromDate != null) {
        matchDate =
            matchDate &&
            !item.date.isBefore(
              _fromDate!.copyWith(hour: 0, minute: 0, second: 0),
            );
      }
      if (_toDate != null) {
        matchDate =
            matchDate &&
            !item.date.isAfter(
              _toDate!.copyWith(hour: 23, minute: 59, second: 59),
            );
      }
      bool isRedeemTransaction =
          !item.id.startsWith("DAILY") && !item.id.startsWith("TASK");

      return matchRole && matchDate && isRedeemTransaction;
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
                        "Lịch sử giao dịch",
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
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // 1. THẺ THỐNG KÊ
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
                                      Icons.history,
                                      color: Colors.white,
                                      size: 30,
                                    ),
                                    SizedBox(width: 15),
                                    Text(
                                      "Giao dịch",
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 18,
                                      ),
                                    ),
                                  ],
                                ),
                                Text(
                                  "${filteredList.length}",
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

                          // 2. BỘ LỌC NGÀY
                          _buildDateInput("Từ ngày", _fromDateController, true),
                          const SizedBox(height: 15),
                          _buildDateInput("Đến ngày", _toDateController, false),

                          const SizedBox(height: 20),

                          // 3. BỘ LỌC LOẠI GIAO DỊCH
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: [
                                const Text(
                                  "Loại giao dịch",
                                  style: TextStyle(fontWeight: FontWeight.w500),
                                ),
                                const SizedBox(width: 15),
                                _buildFilterChip(
                                  "Bên mua",
                                  Colors.red[100]!,
                                  Colors.red[900]!,
                                ),
                                const SizedBox(width: 10),
                                _buildFilterChip(
                                  "Bên bán",
                                  Colors.blue[100]!,
                                  Colors.blue[900]!,
                                ),
                                const SizedBox(width: 10),
                                _buildFilterChip(
                                  "Đổi quà",
                                  Colors.orange[100]!,
                                  Colors.orange[900]!,
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 15),

                          // Nút "Hiển thị tất cả"
                          GestureDetector(
                            onTap: () => setState(() => _selectedRole = "All"),
                            child: Row(
                              children: [
                                Icon(
                                  _selectedRole == "All"
                                      ? Icons.radio_button_checked
                                      : Icons.radio_button_unchecked,
                                  size: 24,
                                  color: _selectedRole == "All"
                                      ? const Color(0xFFB71C1C)
                                      : Colors.grey,
                                ),
                                const SizedBox(width: 10),
                                const Text(
                                  "Hiển thị tất cả giao dịch",
                                  style: TextStyle(fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 20),
                          const Divider(thickness: 1, color: Colors.black12),
                          const SizedBox(height: 10),

                          // 4. DANH SÁCH GIAO DỊCH
                          filteredList.isEmpty
                              ? const Center(
                                  child: Padding(
                                    padding: EdgeInsets.only(top: 50),
                                    child: Text(
                                      "Chưa có giao dịch nào.",
                                      style: TextStyle(color: Colors.grey),
                                    ),
                                  ),
                                )
                              : ListView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: filteredList.length,
                                  itemBuilder: (context, index) =>
                                      _buildTransactionCard(
                                        filteredList[index],
                                      ),
                                ),
                          const SizedBox(height: 50),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  // --- Widget ô chọn ngày ---
  Widget _buildDateInput(
    String label,
    TextEditingController controller,
    bool isFrom,
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
            onTap: () => _selectDate(context, controller, isFrom),
            child: Container(
              height: 45,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.black12),
              ),
              child: TextField(
                controller: controller,
                enabled: false,
                textAlignVertical: TextAlignVertical.center,
                style: const TextStyle(color: Colors.black),
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.zero,
                  suffixIcon: Icon(
                    Icons.calendar_today,
                    size: 18,
                    color: Colors.grey,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // --- Widget nút lọc ---
  Widget _buildFilterChip(String label, Color bg, Color text) {
    bool isSelected = _selectedRole == label;
    return InkWell(
      onTap: () => setState(() => _selectedRole = isSelected ? "All" : label),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? bg : Colors.grey[200],
          borderRadius: BorderRadius.circular(20),
          border: isSelected ? Border.all(color: text.withOpacity(0.5)) : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? text : Colors.black54,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ),
    );
  }

  // --- Widget Thẻ Giao Dịch ---
  Widget _buildTransactionCard(TransactionItem item) {
    // Xác định màu trạng thái
    Color statusColor = Colors.green;

    // Logic màu sắc dựa trên trạng thái thật từ API
    if (item.status == TransactionStatus.pending) {
      statusColor = Colors.orange; // Chờ nhận
    } else if (item.status == TransactionStatus.completed) {
      statusColor = Colors.green; // Đã xong
    } else if (item.status == TransactionStatus.expired) {
      statusColor = Colors.grey; // Hết hạn
    } else if (item.status == TransactionStatus.cancelled) {
      statusColor = Colors.red; // Hủy
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFFCE4EC),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          _buildRowInfo("Mã giao dịch", item.id), // Hiển thị mã Code đổi quà
          const SizedBox(height: 10),
          _buildRowInfo("Tên món", item.itemName),
          const SizedBox(height: 10),
          _buildRowInfo("Trạng thái", item.statusText, valueColor: statusColor),
          const SizedBox(height: 10),
          if (item.status == TransactionStatus.pending) ...[
            _buildRowInfo(
              "Hạn nhận",
              "${item.expiresAt.day}/${item.expiresAt.month}/${item.expiresAt.year} ${item.expiresAt.hour}:${item.expiresAt.minute.toString().padLeft(2, '0')}",
              valueColor: Colors.deepOrange,
            ),
            const SizedBox(height: 10),
          ],
          _buildRowInfo("Vai trò", item.role),
          const SizedBox(height: 10),
          _buildRowInfo("Chi phí", item.price),
          const SizedBox(height: 10),
          _buildRowInfo(
            "Ngày tạo",
            "${item.date.day}/${item.date.month}/${item.date.year}",
          ),
        ],
      ),
    );
  }

  // Helper tạo dòng thông tin
  Widget _buildRowInfo(String label, String value, {Color? valueColor}) {
    return Row(
      children: [
        SizedBox(
          width: 90,
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Colors.black87,
            ),
          ),
        ),
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: valueColor ?? Colors.black87,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ),
      ],
    );
  }
}
