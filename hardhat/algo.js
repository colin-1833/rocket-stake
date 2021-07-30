const calc_fee_entitlement_floors = (
  previous_entitlement_floor,
  fee_total,
  staker_reth_n_plus_one,
  staker_reth_n
) => {
  if (staker_reth_n_plus_one == 0) {
    return fee_total;
  }
  if (staker_reth_n == 0) {
      return fee_total;
  }
  const entitlement_floor = fee_total - (
    (fee_total * (staker_reth_n / staker_reth_n_plus_one))
      - (previous_entitlement_floor * (staker_reth_n / staker_reth_n_plus_one))
  );
  if (entitlement_floor < 0) {
      return previous_entitlement_floor;
  }
  return entitlement_floor;
};

const Rs_1 = [2, 4, 5, 6];
const Fs_1 = [100, 200, 600, 650];

const Rs_2 = [8, 100, 1000, 1001];
const Fs_2 = [100, 200, 600, 650];

const get_entitlement_floors = (Rs, Fs) => {
  let entitlement_floors = [];

  Rs.forEach((_, i) => {
    if (i === 0) {
      return entitlement_floors.push(Fs[i])
    }
    const data = {
      index: i,
      last_entitlement: entitlement_floors[i - 1],
      current_entitlement: calc_fee_entitlement_floors(
        entitlement_floors[i - 1],
        Fs[i],
        Rs[i],
        Rs[i - 1]
      ),
      fee_total: Fs[i],
      staker_reth_n_current: Rs[i],
      staker_reth_n_last: Rs[i - 1]
    };
    console.log(data)
    entitlement_floors.push(data.current_entitlement);
  });
}

console.log(get_entitlement_floors(Rs_1, Fs_1));
console.log(get_entitlement_floors(Rs_2, Fs_2));