import { TestBed } from '@angular/core/testing';

import { PdfParser } from './pdf-parser';

describe('PdfParser', () => {
  let service: PdfParser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfParser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
