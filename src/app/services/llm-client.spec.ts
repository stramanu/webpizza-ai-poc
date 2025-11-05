import { TestBed } from '@angular/core/testing';

import { LlmClient } from './llm-client';

describe('LlmClient', () => {
  let service: LlmClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LlmClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
