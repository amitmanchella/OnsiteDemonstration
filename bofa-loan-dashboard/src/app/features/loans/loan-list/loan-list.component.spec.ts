import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoanListComponent } from './loan-list.component';
import { SharedModule } from '../../../../app/shared/shared.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('LoanListComponent', () => {
  let component: LoanListComponent;
  let fixture: ComponentFixture<LoanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [LoanListComponent],
    imports: [RouterTestingModule,
        SharedModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have loading true initially', () => {
    expect(component.loading).toBeTrue();
  });
});
