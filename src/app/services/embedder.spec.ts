import { TestBed } from '@angular/core/testing';

import { Embedder } from './embedder';

describe('Embedder', () => {
  let service: Embedder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Embedder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
