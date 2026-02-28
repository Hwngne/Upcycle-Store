import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
//import 'components/mobile_layout.dart';
//import 'pages/auth/login_page.dart';
import 'pages/auth/splash_page.dart';
import 'package:bot_toast/bot_toast.dart';

void main() {
  // Chỉnh màu thanh status bar trong suốt cho đẹp
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const EcoApp());
}

class EcoApp extends StatelessWidget {
  const EcoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      builder: BotToastInit(), 
      navigatorObservers: [BotToastNavigatorObserver()],
      debugShowCheckedModeBanner: false,
      title: 'Eco App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        fontFamily: 'Roboto',
        useMaterial3: true,
      ),
      home: const SplashPage(),
    );
  }
}
