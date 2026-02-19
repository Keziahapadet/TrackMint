import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryIcon } from './category-icon';

describe('CategoryIcon', () => {
  let component: CategoryIcon;
  let fixture: ComponentFixture<CategoryIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryIcon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryIcon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
