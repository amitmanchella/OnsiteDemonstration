import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-loan-application',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, RouterModule],
  templateUrl: './loan-application.component.html',
  styleUrls: ['./loan-application.component.scss']
})
export class LoanApplicationComponent implements OnInit {
  applicationForm!: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';

  loanTypes = [
    { value: 'personal', label: 'Personal Loan' },
    { value: 'mortgage', label: 'Mortgage' },
    { value: 'auto', label: 'Auto Loan' },
    { value: 'business', label: 'Business Loan' }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.applicationForm = this.fb.group({
      applicantName: ['', [Validators.required, Validators.minLength(2)]],
      amount: [null, [Validators.required, Validators.min(1000), Validators.max(10000000)]],
      interestRate: [null, [Validators.required, Validators.min(0), Validators.max(30)]],
      term: [null, [Validators.required, Validators.min(6), Validators.max(360)]],
      type: ['', Validators.required],
      riskScore: [50, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  onSubmit(): void {
    if (this.applicationForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.apiService.createLoan(this.applicationForm.value).subscribe({
      next: (loan) => {
        this.loading = false;
        this.router.navigate(['/loans', loan.id]);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to create loan application';
      }
    });
  }

  get f() {
    return this.applicationForm.controls;
  }
}
