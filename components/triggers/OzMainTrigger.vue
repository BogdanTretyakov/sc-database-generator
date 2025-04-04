<template>
  <v-data-table hide-default-footer>
    <template #headers>
      <tr>
        <th>Minute</th>
        <th>Buildings: Armor</th>
        <th>Units: MS</th>
        <th>Units: Damage</th>
      </tr>
    </template>
    <template #body>
      <tr>
        <td>70</td>
        <td>-5</td>
        <td>-</td>
        <td>-</td>
      </tr>
      <tr>
        <td>80</td>
        <td>-10</td>
        <td>-</td>
        <td>-</td>
      </tr>
      <tr>
        <td>90</td>
        <td>-15</td>
        <td>+10%</td>
        <td>-</td>
      </tr>
      <tr>
        <td>100</td>
        <td>-20</td>
        <td>+20%</td>
        <td>+30%</td>
      </tr>
      <tr>
        <td>110</td>
        <td>-25</td>
        <td>+30%</td>
        <td>+60%</td>
      </tr>
      <tr>
        <td>120</td>
        <td>-40</td>
        <td>+40%</td>
        <td>+90%</td>
      </tr>
    </template>
  </v-data-table>
</template>
