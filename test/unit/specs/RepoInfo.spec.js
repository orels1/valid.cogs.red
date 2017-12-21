import Vue from 'vue';
import RepoInfo from '@/components/RepoInfo';

// const renderWithProps = (Component, propsData) => {
//   const Constructor = Vue.extend(Component);
//   return new Constructor({ propsData }).$mount();
// };

describe('RepoInfo component', () => {
  it('computes default info property', () => {
    const vm = new Vue(RepoInfo);
    expect(vm.info).toEqual([]);
  });

  test('sets default props', () => {
    const propsList = ['code', 'type']; // list of default props
    const vm = new Vue(RepoInfo);
    const props = {};

    propsList.forEach((prop) => {
      props[prop] = vm[prop];
    });
    expect(props).toMatchSnapshot();
  });
});
