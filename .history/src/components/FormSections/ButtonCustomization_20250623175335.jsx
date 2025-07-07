// src/components/FormSections/ButtonCustomization.jsx
import { useEventContext } from '@/contexts/EventContext'
import { useForm } from 'react-hook-form'
import PlatformSelector from '../UI/PlatformSelector'

const buttonStyles = [
  { id: 'standard', name: 'Standard' },
  { id: 'outlined', name: 'Outlined' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'pill', name: 'Pill' }
]

const buttonSizes = [
  { id: 'small', name: 'Small' },
  { id: 'medium', name: 'Medium' },
  { id: 'large', name: 'Large' }
]

const colorOptions = [
  { id: 'blue', value: '#4D90FF', name: 'Blue' },
  { id: 'green', value: '#34C759', name: 'Green' },
  { id: 'purple', value: '#AF52DE', name: 'Purple' },
  { id: 'orange', value: '#FF9500', name: 'Orange' },
  { id: 'red', value: '#FF3B30', name: 'Red' }
]

export default function ButtonCustomization() {
  const { buttonData, updateButton } = useEventContext()
  
  const { register, handleSubmit, watch } = useForm({
    defaultValues: buttonData,
    mode: 'onChange'
  })

  const onSubmit = (data) => {
    updateButton(data)
  }

  return (
    <form onChange={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Button Style
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {buttonStyles.map((style) => (
            <label key={style.id} className="cursor-pointer">
              <input
                {...register('buttonStyle')}
                type="radio"
                value={style.id}
                className="sr-only"
              />
              <div className="border-2 border-gray-200 rounded-lg p-3 text-center hover:border-primary-300 transition-colors">
                <span className="text-sm font-medium">{style.name}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Button Size
        </label>
        <div className="flex space-x-2">
          {buttonSizes.map((size) => (
            <label key={size.id} className="cursor-pointer">
              <input
                {...register('buttonSize')}
                type="radio"
                value={size.id}
                className="sr-only"
              />
              <div className="border-2 border-gray-200 rounded-lg px-4 py-2 text-center hover:border-primary-300 transition-colors">
                <span className="text-sm font-medium">{size.name}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Button Color
        </label>
        <div className="flex flex-wrap gap-3">
          {colorOptions.map((color) => (
            <label key={color.id} className="cursor-pointer">
              <input
                {...register('colorTheme')}
                type="radio"
                value={color.value}
                className="sr-only"
              />
              <div
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            </label>
          ))}
          <div>
            <input
              {...register('colorTheme')}
              type="color"
              className="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Calendar Platforms
        </label>
        <PlatformSelector />
      </div>

      <div className="space-y-3">
        <div className="flex items-center">
          <input
            {...register('showIcons')}
            type="checkbox"
            id="showIcons"
            className="h-4 w-4 text-emerald-500 focus:ring-primary-400 border-gray-300 rounded"
          />
          <label htmlFor="showIcons" className="ml-2 block text-sm text-gray-700">
            Show calendar icons
          </label>
        </div>

        <div className="flex items-center">
          <input
            {...register('responsive')}
            type="checkbox"
            id="responsive"
            className="h-4 w-4 text-emerald-500 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="responsive" className="ml-2 block text-sm text-gray-700">
            Responsive sizing
          </label>
        </div>
      </div>
    </form>
  )
}