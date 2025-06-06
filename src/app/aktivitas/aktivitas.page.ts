import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-aktivitas',
  templateUrl: './aktivitas.page.html',
  styleUrls: ['./aktivitas.page.scss'],
})
export class AktivitasPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  doRefresh(event: any) {
    console.log('Begin async operation');

    // Simulate loading data
    setTimeout(() => {
      console.log('Async operation has ended');
      // Complete the refresh operation
      event.target.complete();
    }, 2000);
  }
}