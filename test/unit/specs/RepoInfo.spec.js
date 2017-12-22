import Vue from 'vue';
import RepoInfo from '@/components/RepoInfo';
import { render, CssModuleTestHelperMixin } from '../utils';

Vue.use(CssModuleTestHelperMixin);

describe('RepoInfo component', () => {
  it('computes default info property', () => {
    const { wrapper } = render(RepoInfo);
    expect(wrapper.vm.info).toEqual([]);
  });

  it('omits DISABLED field', () => {
    const { wrapper } = render(RepoInfo, { code: {
      DISABLED: true,
      foo: 'bar',
    } });
    expect(wrapper.vm.info).toEqual([{ key: 'foo', val: 'bar' }]);
  });

  it('omits undefined or null fields', () => {
    const { wrapper } = render(RepoInfo, { code: {
      foo: null,
      trigger: undefined,
      fizz: 'buzz',
    } });
    expect(wrapper.vm.info).toEqual([{ key: 'fizz', val: 'buzz' }]);
  });

  it('renders arrays as lists', () => {
    const { wrapper } = render(RepoInfo, { code: {
      TAGS: ['some', 'other', 'tag'],
    } });
    expect(wrapper.vm.info).toEqual([{ key: 'TAGS', val: 'some, other, tag' }]);
  });

  test('sets default props', () => {
    const propsList = ['code', 'type']; // list of default props
    const { wrapper } = render(RepoInfo);
    const props = {};

    propsList.forEach((prop) => {
      props[prop] = wrapper.vm[prop];
    });
    expect(props).toMatchSnapshot();
  });

  describe('status line', () => {
    test('hides by default', () => {
      const { wrapper } = render(RepoInfo);
      expect(wrapper.contains('.stausLine')).toBe(false);
    });

    test('shows if status was provided', () => {
      const { wrapper, props } = render(RepoInfo, {
        status: 'foobar',
      });
      expect(wrapper.contains('.statusLine')).toBe(true);
      expect(wrapper.find('.statusLine').text()).toBe(props.status);
    });
  });

  describe('inner block', () => {
    test('hides by default', () => {
      const { wrapper } = render(RepoInfo);
      expect(wrapper.contains('.innerBlock')).toBe(false);
    });

    test('shows if proper code was supplied', () => {
      const { wrapper } = render(RepoInfo, {
        code: { AUTHOR: 'foobar' },
      });
      expect(wrapper.contains('.innerBlock')).toBe(true);
    });

    test('renders supplied code info', () => {
      const { wrapper } = render(RepoInfo, {
        code: {
          AUTHOR: 'foobar',
          NAME: 'fizzbuzz',
        },
      });
      expect(wrapper.find('.innerBlock').html()).toMatchSnapshot();
    });
  });
});
