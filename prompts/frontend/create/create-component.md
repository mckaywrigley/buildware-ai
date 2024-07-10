# New Component Instructions

- Use the file name as the component name. Ex: new-component.tsx = NewComponent
- Create an interface for the component's props
- The component should be an arrow function
- Extend the component from a div unless another element makes more sense

## Example

File: `new-component.tsx`

```tsx
import { cn } from "@/lib/utils"
import { FC, HTMLAttributes } from "react"

interface NewComponentProps extends HTMLAttributes<HTMLDivElement> {
  // Props here
}

export const NewComponent: FC<NewComponentProps> = ({ ...props }) => {
  return (
    <div className={cn("", props.className)}>
      <div>New Component</div>
    </div>
  )
}
```
