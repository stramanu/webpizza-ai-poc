import { TestBed } from '@angular/core/testing';

import { RagEngine } from './rag-engine';

describe('RagEngine', () => {
  let service: RagEngine;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RagEngine);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
