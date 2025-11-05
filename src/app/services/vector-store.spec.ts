import { TestBed } from '@angular/core/testing';

import { VectorStore } from './vector-store';

describe('VectorStore', () => {
  let service: VectorStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VectorStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
