import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { IonicModule, ToastController, IonContent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';
import { Keyboard } from '@capacitor/keyboard';
import { NavController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SafeHtmlPipe],
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild('chatContent', { static: false }) chatContent!: IonContent;
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;

  messageText = '';
  isLoggedIn = false;
  messages: { text: string; sentBy: string; time: string; isWelcome?: boolean }[] = [];
  isLoading = false;

  constructor(
  private toastController: ToastController,
  private navCtrl: NavController,
  private platform: Platform,
  private location: Location,
  private route: ActivatedRoute,
  private cdr: ChangeDetectorRef,
  private ngZone: NgZone
) {
  this.checkLoginAndShowWelcome();
}

  fetchWithTimeout(resource: RequestInfo, options: any = {}): Promise<any> {
  const { timeout = 8000 } = options;

  return Promise.race([
    fetch(resource, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('⏱️ Timeout')), timeout)
    )
  ]);
}
buildChatContext(): string {
  return this.messages
    .map(msg => {
      const role = msg.sentBy === 'user' ? '👤' : '🤖';
      return `${role}: ${msg.text.replace(/<\/?[^>]+(>|$)/g, "")}`; // Hilangkan HTML
    })
    .join('\n');
}


  // Method to scroll to the bottom of the chat messages
 scrollToBottom() {
  this.ngZone.runOutsideAngular(() => {
    setTimeout(() => {
      this.ngZone.run(() => {
        if (this.chatContent) {
          this.chatContent.scrollToBottom(200);
        }
      });
    }, 10);
  });
}


  checkLoginAndShowWelcome() {
    const userStr = localStorage.getItem('currentUser');
    let user;

    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Gagal parse currentUser dari localStorage:', e);
      user = null;
    }

    if (!user || !user.token) {
      console.log('❌ User belum login atau sudah logout, tampilkan welcome message');

      // ✅ Bersihkan data user & chat history saat logout
      localStorage.removeItem('currentUser');
      localStorage.removeItem('chatHistory');
      localStorage.removeItem('lastGreet');
      this.messages = []; // Kosongkan chat UI

      this.isLoggedIn = false;
      this.showWelcomeMessage();
    } else {
      console.log('✅ User sudah login, cek ucapan selamat datang untuk', user.name);
      this.isLoggedIn = true;
      this.loadChatHistory(user.id);
      this.greetUserOncePerDay(user.id, user.name);
    }
  }

  greetUserOncePerDay(userId: string, userName: string) {
    const lastGreetKey = `lastGreet_${userId}`;
    const lastGreetDate = localStorage.getItem(lastGreetKey);
    const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD

    if (lastGreetDate === today) {
      console.log('✅ Ucapan selamat datang sudah dikirim hari ini');
      return;
    }

    this.showHelloMessage(userName);
    localStorage.setItem(lastGreetKey, today);
  }

  loadChatHistory(userId: string) {
    const savedChats = localStorage.getItem(`chatHistory_${userId}`);
    if (savedChats) {
      try {
        this.messages = JSON.parse(savedChats);
        console.log('✅ Chat history dimuat:', this.messages);
      } catch (e) {
        console.error('❌ Gagal parse chat history:', e);
        this.messages = [];
      }
    }
    this.scrollToBottom(); // Scroll to bottom after loading history
  }

  saveChatHistory() {
    if (this.isLoggedIn) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem(`chatHistory_${user.id}`, JSON.stringify(this.messages));
        console.log('💾 Chat history disimpan untuk user:', user.id);
      }
    }
  }

  showHelloMessage(userName: string) {
    const helloText = `👋 Halo <b>${userName}</b>! Selamat datang kembali di <b>SIMPAP Application</b> 🌟<br><br>
Saya adalah <b>Chatky</b>. Ketik pesan untuk memulai percakapan.`;

    const helloMessage = {
      text: helloText,
      sentBy: 'chatky',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isWelcome: true,
    };
    this.messages.push(helloMessage);
    this.saveChatHistory();
    this.scrollToBottom(); // Scroll to bottom after adding message
  }

  ngOnInit() {
    // Cek apakah ada preset message dari queryParams
    this.route.queryParams.subscribe(params => {
      if (params['presetMessage']) {
        this.messageText = params['presetMessage'];
      }
    });

    Keyboard.addListener('keyboardWillShow', (info) => {
      const footer = document.querySelector('.chat-footer') as HTMLElement;
      if (footer) {
        footer.style.bottom = `${info.keyboardHeight}px`;
      }
      this.scrollToBottom(); // Scroll to bottom when keyboard shows
    });

    Keyboard.addListener('keyboardWillHide', () => {
      const footer = document.querySelector('.chat-footer') as HTMLElement;
      if (footer) {
        footer.style.bottom = '0px';
      }
    });
  }

  ngOnDestroy() {
    Keyboard.removeAllListeners();
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (window.history.length > 1) {
        // ✅ Ada halaman sebelumnya, kembali
        this.location.back();
      } else {
        // ✅ Tidak ada history, arahkan ke halaman fallback
        this.navCtrl.navigateRoot('/home'); // Ganti '/home' dengan route yang Anda mau
      }
    });
  }
  goBack() {
    if (window.history.length > 1) {
      this.location.back(); // ✅ Kembali ke halaman sebelumnya
    } else {
      this.navCtrl.navigateRoot('/login'); // ✅ Fallback ke halaman utama
    }
  }

  showWelcomeMessage() {
    const formatText = `👋 Halo! Selamat datang di <b>SIMPAP Application</b> 🌟<br><br>
Saya adalah <b>Chatky</b> yang akan menjadi pemandu kamu.<br><br>
Jika kamu ingin menggunakan aplikasi ini tetapi belum daftar, silakan ketik:<br><br>
<code>!daftar</code><br>
<code>Nama lengkap = (nama lengkap kamu)</code><br>
<code>Email = (email kamu)</code><br>
<code>Password = (password baru minimal 1 huruf kapital & minimal 6 karakter)</code><br><br>
📩 Lalu tunggu balasan disini apakah akunmu sudah terdaftar atau belum.`;

    const welcomeMessage = {
      text: formatText,
      sentBy: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isWelcome: true,
    };
    this.messages.push(welcomeMessage);
    this.scrollToBottom(); // Scroll to bottom after adding message
  }

  async copyFormat() {
    try {
      const format = `!daftar
Nama lengkap = (nama lengkap kamu)
Email = (email kamu)
Password = (password baru minimal 1 huruf kapital & minimal 6 karakter)`;

      await navigator.clipboard.writeText(format);

      const toast = await this.toastController.create({
        message: '✅ Format berhasil disalin ke clipboard!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    } catch (err) {
      console.error('Clipboard Error: ', err);
      const toast = await this.toastController.create({
        message: '❌ Gagal menyalin format!',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  async sendMessage() {
  if (this.messageText.trim().length === 0) return;

  const currentMessage = this.messageText;
  this.messageText = '';
  this.isLoading = true;

  const userMessage = {
    text: currentMessage,
    sentBy: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  this.messages.push(userMessage);
  this.saveChatHistory();
  this.scrollToBottom();

  try {
    const context = this.buildChatContext();

    const response = await this.fetchWithTimeout('https://simpap.kakoi.my.id/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: currentMessage,
        context: context
      }),
      keepalive: true,
      timeout: 8000,
    });

    const data = await response.json();
    const botReply = data.success
      ? data.reply
      : '🤖 Plana tidak mengerti maksudnya 🥲';

    this.messages.push({
      text: botReply,
      sentBy: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    this.saveChatHistory();
  } catch (error) {
    console.error('❌ API Error:', error);
    this.messages.push({
      text: '⚠️ Tidak bisa terhubung ke server. Coba lagi nanti.',
      sentBy: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    this.saveChatHistory();
  } finally {
    this.isLoading = false;
    this.scrollToBottom();
  }
}



  // ✅ Fungsi untuk menghapus chat history
  clearChatHistory() {
    if (this.isLoggedIn) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.removeItem(`chatHistory_${user.id}`); // Hapus chat
        localStorage.removeItem(`lastGreet_${user.id}`); // Hapus greet date
        this.messages = []; // Kosongkan chat di UI
        console.log('🗑️ Chat history dihapus untuk user:', user.id);

        this.showHelloMessage(user.name); // Kirim salam lagi setelah clear
      }
    }
  }
}
