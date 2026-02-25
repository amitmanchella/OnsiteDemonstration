import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  ContentChild,
  TemplateRef,
  AfterViewInit,
  AfterContentInit
} from '@angular/core';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';

export interface DataTableColumn {
  key: string;
  label: string;
  type?: 'text' | 'currency' | 'date' | 'status';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgFor, NgIf, NgTemplateOutlet],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements AfterViewInit, AfterContentInit {
  @Input() data: any[] = [];
  @Input() columns: DataTableColumn[] = [];
  @Input() pageSize: number = 10;

  @ViewChild('tableContainer') tableContainer!: ElementRef;
  @ContentChild('rowActions') rowActionsTemplate!: TemplateRef<any>;

  currentPage: number = 1;

  ngAfterViewInit(): void {
    if (this.tableContainer && this.tableContainer.nativeElement) {
      this.tableContainer.nativeElement.style.maxHeight = '600px';
      this.tableContainer.nativeElement.style.overflow = 'auto';
    }
  }

  ngAfterContentInit(): void {
    if (!this.rowActionsTemplate) {
      console.warn('DataTableComponent: No rowActions template provided. Consider adding <ng-template #rowActions> for action buttons.');
    }
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.data.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize) || 1;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  formatValue(value: any, type?: string): string {
    if (value == null) {
      return '-';
    }

    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString('en-US');
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      default:
        return String(value);
    }
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'active': 'status-active',
      'closed': 'status-closed',
      'completed': 'status-completed',
      'failed': 'status-failed'
    };
    return statusClasses[status.toLowerCase()] || 'status-default';
  }
}
