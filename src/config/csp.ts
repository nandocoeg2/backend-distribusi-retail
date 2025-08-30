import { environment } from './environment';

const self = "'self'";
const unsafeInline = "'unsafe-inline'";
const data = 'data:';
const blob = 'blob:';

const corsOrigins = environment.CORS_ORIGIN.split(',').filter(Boolean);

export const cspOptions = {
  directives: {
    defaultSrc: [self, ...corsOrigins],
    connectSrc: [self, ...corsOrigins],
    scriptSrc: [self, unsafeInline],
    styleSrc: [self, unsafeInline],
    imgSrc: [self, data, blob],
    fontSrc: [self, data],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: [],
  },
};

