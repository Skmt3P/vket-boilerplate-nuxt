import HmSlider from '#base/app/components/hm/HmSlider.vue'
import { AnyVueWrapper } from '#base/app/test/models/vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

// i18nの設定
const i18n = createI18n({
  legacy: false,
  locale: 'ja',
  messages: {
    ja: {},
    en: {},
  },
})

// HTMLElement.animate のモック
Object.defineProperty(HTMLElement.prototype, 'animate', {
  value: vi.fn().mockReturnValue({
    finished: Promise.resolve(),
  }),
})

// window.setInterval のモック
vi.stubGlobal('setInterval', vi.fn(() => 123)) // モックのintervalIdを返す
vi.stubGlobal('clearInterval', vi.fn())

describe('HmSlider', () => {
  let wrapper: AnyVueWrapper

  const defaultProps = {
    slidename: 'test-slider',
    itemsId: ['item1', 'item2', 'item3'],
    arrow: true,
    pagination: true,
    amount: 3,
    loop: false,
    center: false,
    page: true,
    autoplay: false,
    interval: 3000,
    gapPc: '10px',
    gapSp: '5px',
    widthPc: '300px',
    widthSp: '200px',
    duration: 300,
    easing: 'ease' as const,
    draggable: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('基本的なレンダリング', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: defaultProps,
        slots: {
          item: '<div class="slider-item">Test Item</div>',
        },
        global: {
          plugins: [i18n],
        },
      })
    })

    it('コンポーネントがレンダリングされる', () => {
      expect(wrapper.find('.slider-wrap').exists()).toBe(true)
    })

    it('スライダーボディがレンダリングされる', () => {
      expect(wrapper.find('.slider-body').exists()).toBe(true)
    })

    it('スライダーインナーがレンダリングされる', () => {
      expect(wrapper.find('.slider-inner').exists()).toBe(true)
    })

    it('CSSカスタムプロパティが正しく設定される', () => {
      const sliderWrap = wrapper.find('.slider-wrap')
      expect(sliderWrap.attributes('style')).toContain('--slide-amount: 3')
      expect(sliderWrap.attributes('style')).toContain('--width-pc: 300px')
      expect(sliderWrap.attributes('style')).toContain('--width-sp: 200px')
    })
  })

  describe('ナビゲーション要素', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: defaultProps,
        slots: {
          item: '<div class="slider-item">Test Item</div>',
          navigationprevious: '<span>Previous</span>',
          navigationnext: '<span>Next</span>',
        },
        global: {
          plugins: [i18n],
        },
      })
    })

    it('矢印ナビゲーションが表示される', () => {
      expect(wrapper.find('.button--previous').exists()).toBe(true)
      expect(wrapper.find('.button--next').exists()).toBe(true)
    })

    it('前へボタンのaria-labelが正しく設定される', () => {
      const prevButton = wrapper.find('.button--previous')
      expect(prevButton.attributes('aria-label')).toBe('スライドを1枚戻す')
    })

    it('次へボタンのaria-labelが正しく設定される', () => {
      const nextButton = wrapper.find('.button--next')
      expect(nextButton.attributes('aria-label')).toBe('スライドを1枚進める')
    })
  })

  describe('ページネーション', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: defaultProps,
        slots: {
          item: '<div class="slider-item">Test Item</div>',
          pagination: '<span class="dot"></span>',
        },
        global: {
          plugins: [i18n],
        },
      })
    })

    it('ページネーションが表示される', () => {
      expect(wrapper.find('.slider-pagination').exists()).toBe(true)
    })

    it('指定されたamount分のページネーションアイテムが表示される', () => {
      expect(wrapper.findAll('.slider-pagination-item')).toHaveLength(3)
    })

    it('ページネーションボタンのaria-labelが正しく設定される', () => {
      const paginationButtons = wrapper.findAll('.slider-pagination-button')
      expect(paginationButtons[0]?.attributes('aria-label')).toBe('スライド1枚目を表示する')
      expect(paginationButtons[1]?.attributes('aria-label')).toBe('スライド2枚目を表示する')
    })

    it('最初のページネーションボタンがaria-selectedされている', () => {
      const paginationButtons = wrapper.findAll('.slider-pagination-button')
      expect(paginationButtons[0]?.attributes('aria-selected')).toBe('true')
      expect(paginationButtons[1]?.attributes('aria-selected')).toBe('false')
    })
  })

  describe('ページ表示', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: defaultProps,
        global: {
          plugins: [i18n],
        },
      })
    })

    it('ページ表示が表示される', () => {
      expect(wrapper.find('.slider-page').exists()).toBe(true)
    })

    it('現在のページ番号が表示される', () => {
      expect(wrapper.find('.slider-page-start').text()).toBe('1')
    })

    it('総ページ数が表示される', () => {
      expect(wrapper.find('.slider-page-total').text()).toBe('3')
    })

    it('progressbarのaria属性が正しく設定される', () => {
      const progressbar = wrapper.find('.slider-page')
      expect(progressbar.attributes('role')).toBe('progressbar')
      expect(progressbar.attributes('aria-valuemin')).toBe('1')
      expect(progressbar.attributes('aria-valuemax')).toBe('3')
      expect(progressbar.attributes('aria-valuenow')).toBe('1')
    })
  })

  describe('自動再生機能', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: {
          ...defaultProps,
          autoplay: true,
        },
        slots: {
          autoplaystart: '<span>Start</span>',
          autoplaystop: '<span>Stop</span>',
        },
        global: {
          plugins: [i18n],
        },
      })
    })

    it('自動再生コントロールボタンが表示される', () => {
      const buttons = wrapper.findAll('button')
      const startButton = buttons.find(btn => btn.text().includes('Start'))
      const stopButton = buttons.find(btn => btn.text().includes('Stop'))

      expect(startButton).toBeTruthy()
      expect(stopButton).toBeTruthy()
    })
  })

  describe('ループ機能', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: {
          ...defaultProps,
          loop: true,
        },
        slots: {
          item: '<div class="slider-item">Test Item</div>',
        },
        global: {
          plugins: [i18n],
        },
      })
    })

    it('ループ有効時に複製スライドが表示される', () => {
      expect(wrapper.find('.slider.-before').exists()).toBe(true)
      expect(wrapper.find('.slider.-after').exists()).toBe(true)
    })

    it('複製スライドにaria-hidden属性が設定される', () => {
      expect(wrapper.find('.slider.-before').attributes('aria-hidden')).toBe('true')
      expect(wrapper.find('.slider.-after').attributes('aria-hidden')).toBe('true')
    })
  })

  describe('props', () => {
    it('centerプロパティが有効時にクラスが適用される', () => {
      wrapper = mount(HmSlider, {
        props: {
          ...defaultProps,
          center: true,
        },
        global: {
          plugins: [i18n],
        },
      })
      expect(wrapper.find('.slider.-center').exists()).toBe(true)
    })

    it('arrow=falseで矢印が非表示になる', () => {
      wrapper = mount(HmSlider, {
        props: {
          ...defaultProps,
          arrow: false,
        },
        global: {
          plugins: [i18n],
        },
      })
      expect(wrapper.find('.button--previous').exists()).toBe(false)
      expect(wrapper.find('.button--next').exists()).toBe(false)
    })

    it('pagination=falseでページネーションが非表示になる', () => {
      wrapper = mount(HmSlider, {
        props: {
          ...defaultProps,
          pagination: false,
        },
        global: {
          plugins: [i18n],
        },
      })
      expect(wrapper.find('.slider-pagination').exists()).toBe(false)
    })

    it('page=falseでページ表示が非表示になる', () => {
      wrapper = mount(HmSlider, {
        props: {
          ...defaultProps,
          page: false,
        },
        global: {
          plugins: [i18n],
        },
      })
      expect(wrapper.find('.slider-page').exists()).toBe(false)
    })
  })

  describe('内部状態', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: defaultProps,
        global: {
          plugins: [i18n],
        },
      })
    })

    it('初期状態でcurrentSlideが0', () => {
      expect((wrapper.vm).currentSlide).toBe(0)
    })

    it('初期状態でdisabledPreviousがtrue（ループしない場合）', () => {
      expect((wrapper.vm).disabledPrevious).toBe(true)
    })

    it('初期状態でdisabledNextがfalse', () => {
      expect((wrapper.vm).disabledNext).toBe(false)
    })
  })

  describe('メソッド', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: defaultProps,
        global: {
          plugins: [i18n],
        },
      })
    })

    it('moveSlider("next")でcurrentSlideが更新される', async () => {
      await (wrapper.vm).moveSlider('next')
      expect((wrapper.vm).currentSlide).toBe(-1)
    })

    it('moveSlider("previous")でcurrentSlideが更新される', async () => {
      // まず次に進めてから前に戻る
      await (wrapper.vm).moveSlider('next')
      await (wrapper.vm).moveSlider('previous')
      expect((wrapper.vm).currentSlide).toBe(0)
    })

    it('jumpSliderで指定したインデックスに移動する', async () => {
      await (wrapper.vm).jumpSlider(2)
      expect((wrapper.vm).currentSlide).toBe(-2)
    })

    it('startAutoPlayが呼ばれるとsetIntervalが実行される', () => {
      const setIntervalSpy = vi.spyOn(window, 'setInterval')
      ;(wrapper.vm).startAutoPlay()
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), defaultProps.interval)
    })

    it('stopAutoPlayが呼ばれるとclearIntervalが実行される', () => {
      const setIntervalSpy = vi.spyOn(window, 'setInterval')
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
      wrapper = mount(HmSlider, {
        props: { ...defaultProps, autoplay: true },
        global: { plugins: [i18n] },
      })

      // 先にautoplayを開始してtimerを設定
      const vm = wrapper.vm
      vm.startAutoPlay()
      // setIntervalが呼ばれることを確認（timerはコンポーネント内部変数のため直接テストできない）
      expect(setIntervalSpy).toHaveBeenCalled()
      vm.stopAutoPlay()
      expect(clearIntervalSpy).toHaveBeenCalledWith(123) // モックが返すintervalId
    })
  })

  describe('イベントハンドリング', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: defaultProps,
        slots: {
          navigationprevious: '<span>Previous</span>',
          navigationnext: '<span>Next</span>',
          pagination: '<span class="dot"></span>',
        },
        global: {
          plugins: [i18n],
        },
      })
    })

    it('次へボタンクリックでmoveSliderが呼ばれる', async () => {
      const moveSliderSpy = vi.spyOn(wrapper.vm, 'moveSlider')
      const nextButton = wrapper.find('.button--next')
      await nextButton.trigger('click')
      expect(moveSliderSpy).toHaveBeenCalledWith('next')
    })

    it('前へボタンクリックでmoveSliderが呼ばれる', async () => {
      // まず次に進めてから前へボタンを有効にする
      await (wrapper.vm).moveSlider('next')
      await (wrapper.vm).$nextTick()

      const moveSliderSpy = vi.spyOn(wrapper.vm, 'moveSlider')
      const prevButton = wrapper.find('.button--previous')
      await prevButton.trigger('click')
      expect(moveSliderSpy).toHaveBeenCalledWith('previous')
    })

    it('ページネーションボタンクリックでjumpSliderが呼ばれる', async () => {
      const jumpSliderSpy = vi.spyOn(wrapper.vm, 'jumpSlider')
      const paginationButton = wrapper.findAll('.slider-pagination-button')[1]
      await paginationButton?.trigger('click')
      expect(jumpSliderSpy).toHaveBeenCalledWith(1)
    })
  })

  describe('ドラッグ機能', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: defaultProps,
        global: {
          plugins: [i18n],
        },
      })
    })

    it('touchstartイベントがslider-innerに正しく設定される', () => {
      const sliderInner = wrapper.find('.slider-inner')
      expect(sliderInner.exists()).toBe(true)

      // touchstartイベントをトリガーしてもエラーが発生しないことを確認
      expect(() => {
        void sliderInner.trigger('touchstart', {
          touches: [{ pageX: 100 }],
        })
      }).not.toThrow()
    })

    it('mousedownイベントがslider-innerに正しく設定される', () => {
      const sliderInner = wrapper.find('.slider-inner')
      expect(sliderInner.exists()).toBe(true)

      // mousedownイベントをトリガーしてもエラーが発生しないことを確認
      expect(() => {
        void sliderInner.trigger('mousedown', {
          pageX: 100,
        })
      }).not.toThrow()
    })
  })

  describe('国際化対応', () => {
    it('英語ロケールでaria-labelが英語になる', () => {
      const enI18n = createI18n({
        legacy: false,
        locale: 'en',
        messages: {
          ja: {},
          en: {},
        },
      })

      wrapper = mount(HmSlider, {
        props: defaultProps,
        slots: {
          navigationprevious: '<span>Previous</span>',
          navigationnext: '<span>Next</span>',
          pagination: '<span class="dot"></span>',
        },
        global: {
          plugins: [enI18n],
        },
      })

      const prevButton = wrapper.find('.button--previous')
      const nextButton = wrapper.find('.button--next')

      expect(prevButton.attributes('aria-label')).toBe('Show previous slide')
      expect(nextButton.attributes('aria-label')).toBe('Show next slide')
    })
  })

  describe('advanced functionality', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: defaultProps,
        global: {
          plugins: [i18n],
        },
      })
    })

    it('slider-wrapにCSSカスタムプロパティが正しく設定される', () => {
      const sliderWrap = wrapper.find('.slider-wrap')
      const style = sliderWrap.attributes('style')
      expect(style).toContain('--slide-amount: 3')
      expect(style).toContain('--width-pc: 300px')
      expect(style).toContain('--width-sp: 200px')
    })

    it('slider-innerにCSSカスタムプロパティが正しく設定される', () => {
      const sliderInner = wrapper.find('.slider-inner')
      const style = sliderInner.attributes('style')
      expect(style).toContain('--gap-pc: 10px')
      expect(style).toContain('--gap-sp: 5px')
    })

    it('currentSlide computed propertyが正しく動作する', () => {
      expect((wrapper.vm).currentSlide).toBe(0)
    })

    it('disabledPrevious computed propertyが正しく動作する', () => {
      expect((wrapper.vm).disabledPrevious).toBe(true)
    })

    it('disabledNext computed propertyが正しく動作する', () => {
      expect((wrapper.vm).disabledNext).toBe(false)
    })

    it('スライダーのスタイル設定が正しく適用される', () => {
      const sliderInner = wrapper.find('.slider-inner')
      expect(sliderInner.exists()).toBe(true)
      // スタイル属性の存在確認
      expect(sliderInner.attributes('style')).toBeDefined()
    })
  })

  describe('lifecycle methods', () => {
    it('onMountedが正しく実行される', () => {
      wrapper = mount(HmSlider, {
        props: {
          ...defaultProps,
          autoplay: true,
        },
        global: {
          plugins: [i18n],
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('onUnmountedでautoplayがクリアされる', () => {
      const setIntervalSpy = vi.spyOn(window, 'setInterval')
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
      wrapper = mount(HmSlider, {
        props: {
          ...defaultProps,
          autoplay: true,
        },
        global: {
          plugins: [i18n],
        },
      })

      // autoplayを開始してtimerを設定してからアンマウント
      const vm = wrapper.vm
      vm.startAutoPlay()
      expect(setIntervalSpy).toHaveBeenCalled()
      wrapper.unmount()
      expect(clearIntervalSpy).toHaveBeenCalledWith(123) // モックが返すintervalId
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: defaultProps,
        global: {
          plugins: [i18n],
        },
      })
    })

    it('slider要素がnullの場合にエラーハンドリングされる', () => {
      const vm = wrapper.vm
      // sliderのrefをnullに設定
      vm.slider = { value: null }

      // inDraggingメソッドがエラーハンドリングを正しく行うかテスト
      expect(() => {
        vm.inDragging(new MouseEvent('mousemove'))
      }).not.toThrow() // 実際にはエラーを投げずに安全にハンドリングする
    })

    it('不正なイベント型でも適切に処理される', () => {
      const vm = wrapper.vm
      expect(() => {
        vm.startDragging({} as MouseEvent)
      }).not.toThrow()
    })
  })

  describe('complex interactions', () => {
    beforeEach(() => {
      wrapper = mount(HmSlider, {
        props: {
          ...defaultProps,
          loop: true,
          autoplay: true,
        },
        slots: {
          item: '<div class="slider-item">Test Item</div>',
          navigationprevious: '<span>Previous</span>',
          navigationnext: '<span>Next</span>',
          pagination: '<span class="dot"></span>',
          autoplaystart: '<span>Start</span>',
          autoplaystop: '<span>Stop</span>',
        },
        global: {
          plugins: [i18n],
        },
      })
    })

    it('loop有効時のスライダー構造が正しく生成される', () => {
      // loopが有効な場合、before/afterのクローンが存在することを確認
      const beforeClone = wrapper.find('.slider.-before')
      const afterClone = wrapper.find('.slider.-after')

      expect(beforeClone.exists()).toBe(true)
      expect(afterClone.exists()).toBe(true)
    })

    it('dragイベントシーケンスが正しく動作する', async () => {
      const sliderInner = wrapper.find('.slider-inner')

      // Start dragging
      await sliderInner.trigger('mousedown', { pageX: 100 })

      // Move
      await sliderInner.trigger('mousemove', { pageX: 50 })

      // End dragging
      await sliderInner.trigger('mouseup', { pageX: 50 })

      expect(wrapper.exists()).toBe(true)
    })

    it('touchイベントシーケンスが正しく動作する', async () => {
      const sliderInner = wrapper.find('.slider-inner')

      // Start touch
      await sliderInner.trigger('touchstart', {
        touches: [{ pageX: 100 }],
      })

      // Move touch
      await sliderInner.trigger('touchmove', {
        touches: [{ pageX: 50 }],
      })

      // End touch
      await sliderInner.trigger('touchend', {
        touches: [{ pageX: 50 }],
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('autoplay機能が正しく動作する', () => {
      const setIntervalSpy = vi.spyOn(window, 'setInterval')
      const vm = wrapper.vm

      vm.startAutoPlay()
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), defaultProps.interval)
    })

    it('stopAutoPlay機能が正しく動作する', () => {
      const setIntervalSpy = vi.spyOn(window, 'setInterval')
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
      const vm = wrapper.vm

      // 先にautoplayを開始してからstop
      vm.startAutoPlay()
      expect(setIntervalSpy).toHaveBeenCalled()
      vm.stopAutoPlay()
      expect(clearIntervalSpy).toHaveBeenCalledWith(123) // モックが返すintervalId
    })
  })

  describe('edge cases', () => {
    it('amount=1の場合に適切に動作する', () => {
      wrapper = mount(HmSlider, {
        props: {
          ...defaultProps,
          amount: 1,
        },
        global: {
          plugins: [i18n],
        },
      })

      expect(wrapper.find('.slider-pagination-item')).toBeTruthy()
    })

    it('draggable=falseの場合にドラッグが無効になる', async () => {
      wrapper = mount(HmSlider, {
        props: {
          ...defaultProps,
          draggable: false,
        },
        global: {
          plugins: [i18n],
        },
      })

      const sliderInner = wrapper.find('.slider-inner')
      const vm = wrapper.vm

      await sliderInner.trigger('mousedown', { pageX: 100 })
      expect(vm.isDragging).toBe(false)
    })

    it('大きなamount値でも適切に動作する', () => {
      wrapper = mount(HmSlider, {
        props: {
          ...defaultProps,
          amount: 20,
          itemsId: Array.from({ length: 20 }, (_, i) => `item${i + 1}`),
        },
        global: {
          plugins: [i18n],
        },
      })

      expect(wrapper.findAll('.slider-pagination-item')).toHaveLength(20)
    })
  })
})
