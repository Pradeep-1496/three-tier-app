import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { LogService } from '../../services/log-service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs.html',
  styleUrl: './logs.css',
})
export class Logs implements OnInit {
  logService = inject(LogService);

  logs = signal<any[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.getLogs();
  }

  getLogs() {
    this.isLoading.set(true);
    this.logService.getLogs().subscribe({
      next: (res) => {
        console.log(res);
        this.logs.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }
}
