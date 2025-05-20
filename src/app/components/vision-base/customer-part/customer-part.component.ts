import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-customer-part',
  imports: [],
  templateUrl: './customer-part.component.html',
  styleUrl: './customer-part.component.css'
})
export class CustomerPartComponent {
  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.activeModal.close();
  }
}
