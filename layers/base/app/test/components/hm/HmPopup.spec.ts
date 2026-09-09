import { mount } from '@vue/test-utils'
import { describe, test, expect } from 'vitest'
import HmPopup from '#base/app/components/hm/HmPopup.vue'
import { raiseError } from '#base/app/utils/error'

test('ref component', () => {
  expect(HmPopup).toBeTruthy()
})

test('mount component', () => {
  const wrapper = mount(HmPopup, {
    props: {
      title: 'title',
      description: 'description',
      cancelText: 'cancel',
      confirmText: 'confirm',
    },
  })
  expect(wrapper.getCurrentComponent()).toBeTruthy()
  expect(wrapper.html()).toMatchSnapshot()
})

test('optional content is omitted by default', () => {
  const wrapper = mount(HmPopup)

  expect(wrapper.find('.hm-popup-title').exists()).toBe(false)
  expect(wrapper.find('.hm-popup-description').exists()).toBe(false)
  expect(wrapper.find('.hm-popup-wrapper').exists()).toBe(false)
})

test('confirm button can be rendered without a cancel button', () => {
  const wrapper = mount(HmPopup, {
    props: {
      confirmText: 'confirm',
    },
  })

  expect(wrapper.find('.hm-popup-wrapper').exists()).toBe(true)
  expect(wrapper.findAll('.hm-popup-button')).toHaveLength(1)
  expect(wrapper.text()).toContain('confirm')
})

describe('emits', () => {
  test('@close', async () => {
    const wrapper = mount(HmPopup, {
      props: {
        title: 'title',
        description: 'description',
        cancelText: 'cancel',
        confirmText: 'confirm',
      },
    })
    await wrapper.get('.hm-popup').trigger('close-dialog')
    expect(wrapper.emitted()).toHaveProperty('close')
  })

  test('@cancel', async () => {
    const wrapper = mount(HmPopup, {
      props: {
        title: 'title',
        description: 'description',
        cancelText: 'cancel',
        confirmText: 'confirm',
      },
    })

    const cancelButton
      = wrapper.findAll('.hm-popup-button > button')[0]
        ?? raiseError('cancelButton is not found')
    await cancelButton.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('cancel')
  })

  test('@confirm', async () => {
    const wrapper = mount(HmPopup, {
      props: {
        title: 'title',
        description: 'description',
        cancelText: 'cancel',
        confirmText: 'confirm',
      },
    })

    const confirmButton
      = wrapper.findAll('.hm-popup-button > button')[1]
        ?? raiseError('confirmButton is not found')
    await confirmButton.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('confirm')
  })
})
