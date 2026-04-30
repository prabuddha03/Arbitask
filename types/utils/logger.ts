/**
 * @fileoverview Logger utility types for Arbitask
 */

export interface ReqOptionsProps {
  method: string;
  pathname: string;
  status?: number;
}

export interface LogMetadataProps {
  [key: string]: unknown;
}
