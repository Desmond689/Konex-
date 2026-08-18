/**
 * Basic unit test for squad store vertical slice
 * Run: npx jest tests/unit/squadStore.test.ts
 */
import { useSquadStore } from '../../src/store/squadStore';

describe('squadStore', () => {
  beforeEach(() => {
    useSquadStore.getState().reset();
  });

  it('adds a squad', () => {
    const squad = {
      id: 's1',
      name: 'Night Owls',
      tag: 'OWL',
      ownerId: 'u1',
      memberCount: 1,
      isPublic: true,
      createdAt: new Date().toISOString(),
    };
    useSquadStore.getState().addSquad(squad);
    expect(useSquadStore.getState().mySquads).toHaveLength(1);
    expect(useSquadStore.getState().mySquads[0].name).toBe('Night Owls');
  });

  it('removes a squad', () => {
    useSquadStore.getState().addSquad({
      id: 's1',
      name: 'X',
      ownerId: 'u1',
      memberCount: 1,
      isPublic: true,
      createdAt: new Date().toISOString(),
    });
    useSquadStore.getState().removeSquad('s1');
    expect(useSquadStore.getState().mySquads).toHaveLength(0);
  });
});
