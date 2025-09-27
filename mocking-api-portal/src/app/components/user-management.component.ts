import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../services/user.service';
import { ToastService } from '../services/toast.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users = signal<User[]>([]);
  allUsers = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  isEditing = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  showForm = signal<boolean>(false);

  // Pagination properties
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalUsers = signal<number>(0);
  totalPages = signal<number>(0);

  // View mode properties
  viewMode = signal<'table' | 'json' | 'text'>('table');

  // ✅ Search and filter properties
  searchTerm = signal<string>('');
  filterCountry = signal<string>('');
  filteredUsers = signal<User[]>([]);
  availableCountries = signal<string[]>([]);

  // Make Math available in template
  Math = Math;

  newUser: User = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  };

  // ✅ Add destroy subject for cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ✅ Implement proper cleanup
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.allUsers.set(users);
          this.loadAvailableCountries(users);
          this.applyFilters();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoading.set(false);
        }
      });
  }

  loadAvailableCountries(users: User[]): void {
    const countries = Array.from(new Set(users.map(user => user.country).filter(c => c)));
    this.availableCountries.set(countries.sort());
  }

  updatePaginatedUsers(): void {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    const usersToUse = this.filteredUsers().length > 0 ? this.filteredUsers() : this.allUsers();
    const paginatedUsers = usersToUse.slice(startIndex, endIndex);
    this.users.set(paginatedUsers);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updatePaginatedUsers();
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.totalPages.set(Math.ceil(this.totalUsers() / size));
    this.updatePaginatedUsers();
  }

  setViewMode(mode: 'table' | 'json' | 'text'): void {
    this.viewMode.set(mode);
  }

  getJsonView(): string {
    return JSON.stringify(this.users(), null, 2);
  }

  getTextView(): string {
    return this.users().map(user =>
      `ID: ${user.id}\n` +
      `Name: ${user.firstName} ${user.lastName}\n` +
      `Email: ${user.email}\n` +
      `Phone: ${user.phone}\n` +
      `Address: ${user.address}, ${user.city}, ${user.country}\n` +
      '-----------------------------------'
    ).join('\n\n');
  }

  openCreateForm(): void {
    this.selectedUser.set(null);
    this.isEditing.set(false);
    this.showForm.set(true);
    this.resetForm();
  }

  openEditForm(user: User): void {
    this.selectedUser.set(user);
    this.isEditing.set(true);
    this.showForm.set(true);
    this.newUser = { ...user };
  }

  closeForm(): void {
    this.showForm.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: ''
    };
  }

  saveUser(): void {
    if (this.isEditing() && this.selectedUser()) {
      this.userService.updateUser(this.selectedUser()!.id!, this.newUser)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success('Success!', `User ${this.newUser.firstName} ${this.newUser.lastName} has been updated successfully.`);
            this.loadUsers();
            this.closeForm();
          },
          error: (error) => {
            this.toastService.error('Update Failed', 'Failed to update user. Please try again.');
            console.error('Error updating user:', error);
          }
        });
    } else {
      this.userService.createUser(this.newUser)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success('User Created!', `${this.newUser.firstName} ${this.newUser.lastName} has been added successfully.`);
            this.loadUsers();
            this.closeForm();
          },
          error: (error) => {
            this.toastService.error('Creation Failed', 'Failed to create user. Please try again.');
            console.error('Error creating user:', error);
          }
        });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.userService.deleteUser(user.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success('User Deleted!', `${user.firstName} ${user.lastName} has been removed successfully.`);
            this.loadUsers();
          },
          error: (error) => {
            this.toastService.error('Delete Failed', 'Failed to delete user. Please try again.');
            console.error('Error deleting user:', error);
          }
        });
    }
  }

  generateUsers(): void {
    const count = prompt('How many users do you want to generate? (max 100)', '10');
    if (count && !isNaN(Number(count))) {
      this.userService.generateUsers(Number(count))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success('Users Generated!', `Successfully generated ${count} new users.`);
            this.loadUsers();
          },
          error: (error) => {
            this.toastService.error('Generation Failed', 'Failed to generate users. Please try again.');
            console.error('Error generating users:', error);
          }
        });
    }
  }

  // Enhanced clipboard operations with toast notifications
  async copyJsonToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.getJsonView());
      this.toastService.success('Copied!', 'JSON data has been copied to clipboard.');
    } catch (err) {
      this.toastService.error('Copy Failed', 'Failed to copy JSON data to clipboard.');
      console.error('Failed to copy JSON: ', err);
    }
  }

  async copyTextToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.getTextView());
      this.toastService.success('Copied!', 'Text data has been copied to clipboard.');
    } catch (err) {
      this.toastService.error('Copy Failed', 'Failed to copy text data to clipboard.');
      console.error('Failed to copy text: ', err);
    }
  }

  // ✅ Search and filter methods
  applyFilters(): void {
    let filtered = [...this.allUsers()];

    // Filter by country
    if (this.filterCountry()) {
      filtered = filtered.filter(user => user.country === this.filterCountry());
    }

    // Search by term
    if (this.searchTerm()) {
      const searchTermLower = this.searchTerm().toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTermLower) ||
        user.lastName.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        user.phone.includes(searchTermLower) ||
        user.address.toLowerCase().includes(searchTermLower) ||
        user.city.toLowerCase().includes(searchTermLower) ||
        user.country.toLowerCase().includes(searchTermLower)
      );
    }

    this.filteredUsers.set(filtered);
    this.totalUsers.set(filtered.length);
    this.currentPage.set(1); // Reset to first page
    this.totalPages.set(Math.ceil(filtered.length / this.pageSize()));
    this.updatePaginatedUsers();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onCountryFilterChange(country: string): void {
    this.filterCountry.set(country);
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.filterCountry.set('');
    this.applyFilters();
  }

  getPaginationArray(): number[] {
    const maxVisible = 5;
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    if (end - start < maxVisible - 1) {
      if (start === 1) {
        end = Math.min(total, start + maxVisible - 1);
      } else {
        start = Math.max(1, end - maxVisible + 1);
      }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
