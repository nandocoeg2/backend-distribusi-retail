import { RegionService } from '@/services/region.service';

jest.mock('@/config/database', () => ({
  prisma: {
    region: {},
  },
}));

describe('RegionService', () => {
  const baseData = {
    kode_region: 'RGN-001',
    nama_region: 'Region 1',
    createdBy: 'strip-me',
    updatedBy: 'strip-me',
  } as any;

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('createRegion delegates to base createEntity with preprocess', async () => {
    const spy = jest.spyOn(RegionService.prototype as any, 'createEntity').mockResolvedValue('created');

    const result = await RegionService.createRegion(baseData, 'user-1');

    expect(spy).toHaveBeenCalledWith(baseData, 'user-1', expect.any(Function));
    const [, , preprocess] = spy.mock.calls[0] as any[];
    expect(preprocess(baseData, 'user-1')).toEqual({
      kode_region: 'RGN-001',
      nama_region: 'Region 1',
      createdBy: 'user-1',
      updatedBy: 'user-1',
    });
    expect(result).toBe('created');
  });

  it('getAllRegions delegates to getAllEntities', async () => {
    const spy = jest.spyOn(RegionService.prototype as any, 'getAllEntities').mockResolvedValue('list');

    const result = await RegionService.getAllRegions(4, 15);

    expect(spy).toHaveBeenCalledWith(4, 15);
    expect(result).toBe('list');
  });

  it('getRegionById uses base getEntityById', async () => {
    const spy = jest.spyOn(RegionService.prototype as any, 'getEntityById').mockResolvedValue('entity');

    const result = await RegionService.getRegionById('region-1');

    expect(spy).toHaveBeenCalledWith('region-1');
    expect(result).toBe('entity');
  });

  it('updateRegion applies preprocess hook before delegating', async () => {
    const spy = jest.spyOn(RegionService.prototype as any, 'updateEntity').mockResolvedValue('updated');

    const payload = {
      kode_region: 'RGN-001',
      nama_region: 'Region 1',
      updatedBy: 'strip-me',
    } as any;
    const result = await RegionService.updateRegion('region-1', payload, 'user-2');

    expect(spy).toHaveBeenCalledWith('region-1', payload, 'user-2', expect.any(Function));
    const [, , , preprocess] = spy.mock.calls[0] as any[];
    expect(preprocess(payload, 'user-2')).toEqual({
      kode_region: 'RGN-001',
      nama_region: 'Region 1',
      updatedBy: 'user-2',
    });
    expect(result).toBe('updated');
  });

  it('deleteRegion delegates to deleteEntity', async () => {
    const spy = jest.spyOn(RegionService.prototype as any, 'deleteEntity').mockResolvedValue('deleted');

    const result = await RegionService.deleteRegion('region-1', 'user-3');

    expect(spy).toHaveBeenCalledWith('region-1', 'user-3');
    expect(result).toBe('deleted');
  });

  describe('searchRegions', () => {
    it('returns all regions when query is empty', async () => {
      const getAllSpy = jest.spyOn(RegionService.prototype as any, 'getAllEntities').mockResolvedValue('all');

      const result = await RegionService.searchRegions('', 2, 20);

      expect(getAllSpy).toHaveBeenCalledWith(2, 20);
      expect(result).toBe('all');
    });

    it('delegates to searchEntities with constructed filters', async () => {
      const searchSpy = jest.spyOn(RegionService.prototype as any, 'searchEntities').mockResolvedValue('filtered');

      const result = await RegionService.searchRegions('query', 1, 8);

      expect(searchSpy).toHaveBeenCalledWith(
        [
          { kode_region: { contains: 'query', mode: 'insensitive' } },
          { nama_region: { contains: 'query', mode: 'insensitive' } },
        ],
        1,
        8
      );
      expect(result).toBe('filtered');
    });
  });
});
