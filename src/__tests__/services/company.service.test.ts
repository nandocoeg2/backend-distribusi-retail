import { CompanyService } from '@/services/company.service';

jest.mock('@/config/database', () => ({
  prisma: {
    company: {},
  },
}));

describe('CompanyService', () => {
  const baseData = {
    kode_company: 'CMP-001',
    nama_perusahaan: 'Test Company',
    alamat: 'Jl. Test',
    email: 'test@example.com',
    telp: '0800000000',
    createdBy: 'should-strip',
    updatedBy: 'should-strip',
  } as any;

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('createCompany preprocesses audit fields and delegates to base createEntity', async () => {
    const spy = jest.spyOn(CompanyService.prototype as any, 'createEntity').mockResolvedValue({ id: '1' });

    const result = await CompanyService.createCompany(baseData, 'user-1');

    expect(spy).toHaveBeenCalledWith(baseData, 'user-1', expect.any(Function));
    const [, , preprocess] = spy.mock.calls[0] as any[];
    expect(preprocess(baseData, 'user-1')).toEqual({
      kode_company: 'CMP-001',
      nama_perusahaan: 'Test Company',
      alamat: 'Jl. Test',
      email: 'test@example.com',
      telp: '0800000000',
      createdBy: 'user-1',
      updatedBy: 'user-1',
    });
    expect(result).toEqual({ id: '1' });
  });

  it('getAllCompanies forwards pagination defaults to base implementation', async () => {
    const spy = jest.spyOn(CompanyService.prototype as any, 'getAllEntities').mockResolvedValue('paginated');

    const result = await CompanyService.getAllCompanies();

    expect(spy).toHaveBeenCalledWith(1, 10);
    expect(result).toBe('paginated');
  });

  it('getCompanyById delegates to base getEntityById', async () => {
    const spy = jest.spyOn(CompanyService.prototype as any, 'getEntityById').mockResolvedValue('entity');

    const result = await CompanyService.getCompanyById('company-1');

    expect(spy).toHaveBeenCalledWith('company-1');
    expect(result).toBe('entity');
  });

  it('updateCompany applies preprocess hook and delegates to base update', async () => {
    const spy = jest.spyOn(CompanyService.prototype as any, 'updateEntity').mockResolvedValue('updated');

    const payload = {
      kode_company: 'CMP-001',
      nama_perusahaan: 'Test Company',
      alamat: 'Jl. Test',
      email: 'test@example.com',
      telp: '0800000000',
      updatedBy: 'should-strip',
    } as any;
    const result = await CompanyService.updateCompany('company-1', payload, 'user-2');

    expect(spy).toHaveBeenCalledWith('company-1', payload, 'user-2', expect.any(Function));
    const [, , , preprocess] = spy.mock.calls[0] as any[];
    expect(preprocess(payload, 'user-2')).toEqual({
      kode_company: 'CMP-001',
      nama_perusahaan: 'Test Company',
      alamat: 'Jl. Test',
      email: 'test@example.com',
      telp: '0800000000',
      updatedBy: 'user-2',
    });
    expect(result).toBe('updated');
  });

  it('deleteCompany calls base deleteEntity', async () => {
    const spy = jest.spyOn(CompanyService.prototype as any, 'deleteEntity').mockResolvedValue('deleted');

    const result = await CompanyService.deleteCompany('company-1', 'user-3');

    expect(spy).toHaveBeenCalledWith('company-1', 'user-3');
    expect(result).toBe('deleted');
  });

  describe('searchCompanies', () => {
    it('returns all entities when query is omitted', async () => {
      const getAllSpy = jest.spyOn(CompanyService.prototype as any, 'getAllEntities').mockResolvedValue('all');

      const result = await CompanyService.searchCompanies(undefined, 3, 25);

      expect(getAllSpy).toHaveBeenCalledWith(3, 25);
      expect(result).toBe('all');
    });

    it('builds OR filters and delegates to searchEntities', async () => {
      const searchSpy = jest.spyOn(CompanyService.prototype as any, 'searchEntities').mockResolvedValue('filtered');

      const result = await CompanyService.searchCompanies('test', 2, 5);

      expect(searchSpy).toHaveBeenCalledWith(
        [
          { kode_company: { contains: 'test', mode: 'insensitive' } },
          { nama_perusahaan: { contains: 'test', mode: 'insensitive' } },
          { email: { contains: 'test', mode: 'insensitive' } },
          { telp: { contains: 'test', mode: 'insensitive' } },
        ],
        2,
        5
      );
      expect(result).toBe('filtered');
    });
  });
});
