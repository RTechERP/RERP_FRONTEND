import { Component, OnInit } from '@angular/core';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { CustomerSpecializationFormComponent } from './customer-specialization-form/customer-specialization-form.component';
@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  imports: [CustomerFormComponent, CustomerSpecializationFormComponent],
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
